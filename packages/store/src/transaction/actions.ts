import { EstimationMode } from '@emeraldpay/api';
import { EntryId, IEmeraldVault, SignedTx, UnsignedBitcoinTx, UnsignedTx } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  EthereumAddress,
  EthereumReceipt,
  EthereumTransaction,
  EthereumTransactionType,
  EthereumTx,
  Logger,
  PersistentState,
  TokenRegistry,
  blockchainCodeToId,
  isBitcoin,
  isEthereum,
  quantitiesToHex,
  toBigNumber,
} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { BroadcastData, SignData } from './types';
import { findWalletByEntryId } from '../accounts/selectors';
import { Pages } from '../screen';
import { catchError, gotoScreen, showError } from '../screen/actions';
import { IErrorAction, IOpenAction } from '../screen/types';
import { updateTransaction } from '../txhistory/actions';
import { StoredTransaction, UpdateStoredTxAction } from '../txhistory/types';
import { DEFAULT_FEE, DefaultFee, Dispatched, FEE_KEYS, FeePrices, GasPriceType, GasPrices, PriceSort } from '../types';
import { WrappedError } from '../WrappedError';

const log = Logger.forCategory('Store::Transaction');

const { Direction, ChangeType, State, Status } = PersistentState;

function withNonce(tx: EthereumTransaction): (nonce: number) => Promise<EthereumTransaction> {
  return (nonce) => new Promise((resolve) => resolve({ ...tx, nonce: quantitiesToHex(nonce) }));
}

function verifySender(expected: string): (txid: string, raw: string, chain: BlockchainCode) => Promise<SignedTx> {
  return (txid, raw, chain) =>
    new Promise((resolve, reject) => {
      const { chainId } = Blockchains[chain].params;
      const tx = EthereumTx.fromRaw(raw, chainId);

      if (tx.verifySignature()) {
        log.debug('Tx signature verified');

        if (!tx.getSenderAddress().equals(new EthereumAddress(expected))) {
          log.error(`WRONG SENDER: ${tx.getSenderAddress().toString()} != ${expected}`);

          reject(new Error('Emerald Vault returned signature from wrong Sender'));
        } else {
          resolve({ raw, txid });
        }
      } else {
        log.error(`Invalid signature: ${raw}`);

        reject(new Error('Emerald Vault returned invalid signature for the transaction'));
      }
    });
}

function signTx(entryId: string, tx: EthereumTransaction, vault: IEmeraldVault, password?: string): Promise<SignedTx> {
  log.debug(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${tx.blockchain} blockchain`);

  let gasPrices: Record<'gasPrice', string> | Record<'maxGasPrice' | 'priorityGasPrice', string>;

  if (tx.type === EthereumTransactionType.EIP1559) {
    const maxGasPrice = typeof tx.maxGasPrice === 'string' ? tx.maxGasPrice : tx.maxGasPrice?.toString() ?? '0';
    const priorityGasPrice =
      typeof tx.priorityGasPrice === 'string' ? tx.priorityGasPrice : tx.priorityGasPrice?.toString() ?? '0';

    gasPrices = {
      maxGasPrice,
      priorityGasPrice,
    };
  } else {
    const gasPrice = typeof tx.gasPrice === 'string' ? tx.gasPrice : tx.gasPrice?.toString() ?? '0';

    gasPrices = { gasPrice };
  }

  const unsignedTx: UnsignedTx = {
    ...gasPrices,
    data: tx.data,
    from: tx.from,
    gas: typeof tx.gas === 'string' ? parseInt(tx.gas) : tx.gas,
    nonce: typeof tx.nonce === 'string' ? parseInt(tx.nonce) : tx.nonce ?? 0,
    to: tx.to,
    value: typeof tx.value === 'string' ? tx.value : tx.value.toString(),
  };

  return vault.signTx(entryId, unsignedTx, password);
}

export function signTransaction(
  entryId: string,
  transaction: EthereumTransaction,
  password?: string,
): Dispatched<SignData | undefined> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (dispatch, getState, extra) => {
    const callSignTx = (tx: EthereumTransaction): Promise<SignData> =>
      signTx(entryId, tx, extra.api.vault, password)
        .then(({ raw, txid }) => verifySender(tx.from)(txid, raw, tx.blockchain))
        .then(({ raw: signed, txid: txId }) => ({ tx, txId, signed, blockchain: tx.blockchain, entryId: entryId }));

    if (transaction.nonce == null) {
      return extra.backendApi
        .getNonce(transaction.blockchain, transaction.from)
        .then(withNonce(transaction))
        .then(callSignTx)
        .catch((error) => {
          catchError(dispatch)(error);

          return undefined;
        });
    }

    return callSignTx(transaction).catch((error) => {
      catchError(dispatch)(error);

      return undefined;
    });
  };
}

type SignHandler = (txid: string | null, raw: string | null, err?: string) => void;

export function signBitcoinTransaction(
  entryId: EntryId,
  tx: UnsignedBitcoinTx,
  password: string,
  handler: SignHandler,
): Dispatched {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (dispatch: any, getState, extra) => {
    extra.api.vault
      .signTx(entryId, tx, password)
      .then(({ raw, txid }) => handler(txid, raw))
      .catch((error) => {
        dispatch(showError(error));

        return handler(null, null, 'Internal error. ' + error?.message);
      });
  };
}

export function broadcastTx({
  blockchain,
  entryId,
  fee,
  originalAmount,
  signed,
  tokenAmount,
  tx,
  txId,
}: BroadcastData): Dispatched<void, IErrorAction | IOpenAction | UpdateStoredTxAction> {
  return async (dispatch, getState, extra) => {
    try {
      await extra.backendApi.broadcastSignedTx(blockchain, signed);

      let changes: PersistentState.Change[] = [];

      const feeChange = {
        asset: fee.units.top.code,
        amount: fee.number.toString(),
        direction: Direction.SPEND,
        type: ChangeType.FEE,
      };

      if (isBitcoin(blockchain)) {
        const asset = blockchain === BlockchainCode.TestBTC ? 'TESTBTC' : 'BTC';
        const bitcoinTx = tx as UnsignedBitcoinTx;

        changes = [feeChange]
          .concat(
            bitcoinTx.inputs.map<PersistentState.Change>((input) => ({
              asset,
              address: input.address,
              amount: input.amount.toString(),
              direction: Direction.SPEND,
              type: ChangeType.TRANSFER,
              wallet: input.entryId,
            })),
          )
          .concat(
            bitcoinTx.outputs.map((output) => ({
              asset,
              address: output.address,
              amount: output.amount.toString(),
              direction: Direction.EARN,
              type: ChangeType.TRANSFER,
              wallet: output.entryId,
            })),
          );
      } else if (isEthereum(blockchain)) {
        const ethereumTx = tx as EthereumTransaction;

        if (originalAmount != null) {
          const amount = originalAmount.number.toString();
          const asset = originalAmount.units.top.code;

          changes = [
            {
              ...feeChange,
              address: ethereumTx.from,
            },
            {
              amount,
              asset,
              address: ethereumTx.from,
              direction: Direction.SPEND,
              type: ChangeType.TRANSFER,
              wallet: entryId,
            },
            {
              amount,
              asset,
              address: ethereumTx.to,
              direction: Direction.EARN,
              type: ChangeType.TRANSFER,
            },
          ];
        }

        if (tokenAmount != null) {
          const amount = tokenAmount.number.toString();
          const asset = tokenAmount.units.top.code;

          changes = [
            ...changes,
            {
              amount,
              asset,
              address: ethereumTx.to,
              direction: Direction.SPEND,
              type: ChangeType.TRANSFER,
            },
            {
              amount,
              asset,
              address: ethereumTx.from,
              direction: Direction.EARN,
              type: ChangeType.TRANSFER,
              wallet: entryId,
            },
          ];
        }
      }

      const transaction = await extra.api.txHistory.submit({
        changes,
        txId,
        blockchain: blockchainCodeToId(blockchain),
        sinceTimestamp: new Date(),
        state: State.SUBMITTED,
        status: Status.UNKNOWN,
      });

      const state = getState();
      const wallet = findWalletByEntryId(state, entryId);

      if (wallet != null) {
        dispatch(updateTransaction(wallet.id, transaction, null));
      }

      const tokenRegistry = new TokenRegistry(state.application.tokens);

      dispatch(gotoScreen(Pages.TX_DETAILS, new StoredTransaction(tokenRegistry, transaction, null)));
    } catch (exception) {
      if (exception instanceof Error) {
        const transaction = getState().history.transactions.find((tx) => tx.txId === txId);

        dispatch(showError(new WrappedError(exception, transaction)));
      }
    }
  };
}

function toEthereumHex(value: BigNumber | number | string | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }

  let hex: string | number;

  if (typeof value === 'string') {
    if (value.substring(0, 2) === '0x') {
      return value;
    }

    hex = new BigNumber(value).toString(16);
  } else {
    hex = value.toString(16);
  }

  return `0x${hex}`;
}

export function estimateGas(blockchain: BlockchainCode, tx: EthereumTransaction): Dispatched<number> {
  return (dispatch, getState, extra) => {
    const { data, from, gasPrice, maxGasPrice, priorityGasPrice, to, value } = tx;

    if (to == null) {
      return -1;
    }

    return extra.backendApi.estimateTxCost(blockchain, {
      data,
      from,
      to,
      gasPrice: toEthereumHex(gasPrice),
      maxFeePerGas: toEthereumHex(maxGasPrice),
      maxPriorityFeePerGas: toEthereumHex(priorityGasPrice),
      value: toEthereumHex(value),
    });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Dispatched<any> {
  return (dispatch, getState, extra) => {
    return extra.backendApi.estimateFee(blockchain, blocks, mode);
  };
}

function sortBigNumber(first: BigNumber, second: BigNumber): number {
  if (first.eq(second)) {
    return 0;
  }

  return first.gt(second) ? 1 : -1;
}

export function getFee(blockchain: BlockchainCode, defaultFee: DefaultFee): Dispatched<FeePrices<GasPrices>> {
  return async (dispatch) => {
    let results = await Promise.allSettled(FEE_KEYS.map((key) => dispatch(estimateFee(blockchain, 128, key))));

    results = await Promise.allSettled(
      results.map((result, index) =>
        result.status === 'fulfilled'
          ? Promise.resolve(result.value)
          : dispatch(estimateFee(blockchain, 256, FEE_KEYS[index])),
      ),
    );

    let [avgLast, avgTail5, avgMiddle] = results.map((result) => {
      const value = result.status === 'fulfilled' ? result.value ?? DEFAULT_FEE : DEFAULT_FEE;

      let max: GasPriceType;
      let priority: GasPriceType;

      if (typeof value === 'string') {
        ({ max, priority } = { ...DEFAULT_FEE, max: value });
      } else {
        ({ max, priority } = value);
      }

      return {
        max: new BigNumber(max),
        priority: new BigNumber(priority),
      };
    });

    let { highs, priorities } = [avgLast, avgTail5, avgMiddle].reduce<PriceSort>(
      (carry, item) => ({
        highs: [...carry.highs, item.max],
        priorities: [...carry.priorities, item.priority],
      }),
      {
        highs: [],
        priorities: [],
      },
    );

    highs = highs.sort(sortBigNumber);
    priorities = priorities.sort(sortBigNumber);

    [avgLast, avgTail5, avgMiddle] = highs.reduce<Array<GasPrices<BigNumber>>>(
      (carry, item, index) => [
        ...carry,
        {
          max: item,
          priority: priorities[index],
        },
      ],
      [],
    );

    if (avgTail5.max.eq(0)) {
      return {
        avgLast: {
          max: defaultFee.min,
          priority: defaultFee.priority_min ?? '0',
        },
        avgMiddle: {
          max: defaultFee.max,
          priority: defaultFee.priority_max ?? '0',
        },
        avgTail5: {
          max: defaultFee.std,
          priority: defaultFee.priority_std ?? '0',
        },
      };
    }

    return {
      avgLast: {
        max: avgLast.max.toString(),
        priority: avgLast.priority.toString(),
      },
      avgMiddle: {
        max: avgMiddle.max.toString(),
        priority: avgMiddle.priority.toString(),
      },
      avgTail5: {
        max: avgTail5.max.toString(),
        priority: avgTail5.priority.toString(),
      },
    };
  };
}

export function getEthReceipt(blockchain: BlockchainCode, hash: string): Dispatched<EthereumReceipt | null> {
  return async (dispatch, getState, extra) => {
    const rawReceipt = await extra.backendApi.getEthReceipt(blockchain, hash);

    if (rawReceipt == null) {
      return null;
    }

    return {
      ...rawReceipt,
      blockNumber: parseInt(rawReceipt.blockNumber, 16),
      cumulativeGasUsed: parseInt(rawReceipt.cumulativeGasUsed, 16),
      effectiveGasPrice: rawReceipt.effectiveGasPrice == null ? undefined : parseInt(rawReceipt.effectiveGasPrice, 16),
      gasUsed: parseInt(rawReceipt.gasUsed, 16),
      status: parseInt(rawReceipt.status, 16),
      transactionIndex: parseInt(rawReceipt.transactionIndex, 16),
    };
  };
}

export function getEthTx(blockchain: BlockchainCode, hash: string): Dispatched<EthereumTransaction | null> {
  return async (dispatch, getState, extra) => {
    const rawTx = await extra.backendApi.getEthTx(blockchain, hash);

    if (rawTx == null) {
      return null;
    }

    return {
      blockchain,
      blockNumber: rawTx.blockNumber == null ? undefined : parseInt(rawTx.blockNumber, 16),
      data: rawTx.input,
      from: rawTx.from,
      gas: parseInt(rawTx.gas, 16),
      gasPrice: rawTx.gasPrice == null ? undefined : toBigNumber(rawTx.gasPrice),
      maxGasPrice: rawTx.maxFeePerGas == null ? undefined : toBigNumber(rawTx.maxFeePerGas),
      priorityGasPrice: rawTx.maxPriorityFeePerGas == null ? undefined : toBigNumber(rawTx.maxPriorityFeePerGas),
      hash: rawTx.hash,
      nonce: parseInt(rawTx.nonce, 16),
      to: rawTx.to,
      type: parseInt(rawTx.type, 16) === 2 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
      value: toBigNumber(rawTx.value),
    };
  };
}

export function setXPubCurrentIndex(xpub: string, position: number): Dispatched {
  return (dispatch, getState, extra) => extra.api.xPubPos.setCurrentAddressAt(xpub, position);
}

export function getXPubLastIndex(
  blockchain: BlockchainCode,
  xpub: string,
  start: number,
): Dispatched<number | undefined> {
  return (dispatch, getState, extra) => extra.backendApi.getXPubLastIndex(blockchain, xpub, start);
}
