import { EstimationMode } from '@emeraldpay/api';
import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { SignedTx, UnsignedTx } from '@emeraldpay/emerald-vault-core';
import { EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core/lib/types';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core/lib/vault';
import {
  AnyCoinCode,
  BlockchainCode,
  Blockchains,
  EthereumAddress,
  EthereumReceipt,
  EthereumTransaction,
  EthereumTx,
  Logger,
  PersistentState,
  blockchainCodeToId,
  isBitcoin,
  isEthereum,
  quantitiesToHex,
  toBigNumber,
} from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import BigNumber from 'bignumber.js';
import { findWalletByEntryId } from '../accounts/selectors';
import { Pages } from '../screen';
import { catchError, gotoScreen, showError } from '../screen/actions';
import { updateTransaction } from '../txhistory/actions';
import { StoredTransaction } from '../txhistory/types';
import {
  DEFAULT_FEE,
  DefaultFee,
  Dispatched,
  FEE_KEYS,
  FeePrices,
  GasPriceType,
  GasPrices,
  IExtraArgument,
  PriceSort,
} from '../types';

const log = Logger.forCategory('store.transaction');

const { Direction, ChangeType, State, Status } = PersistentState;

function withNonce(tx: EthereumTransaction): (nonce: number) => Promise<EthereumTransaction> {
  return (nonce) => new Promise((resolve) => resolve({ ...tx, nonce: quantitiesToHex(nonce) }));
}

function verifySender(expected: string): (txid: string, raw: string, chain: BlockchainCode) => Promise<SignedTx> {
  return (txid, raw, chain) =>
    new Promise((resolve, reject) => {
      // Find chain id
      const chainId = Blockchains[chain].params.chainId;
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

function signTx(
  vault: IEmeraldVault,
  accountId: string,
  tx: EthereumTransaction,
  passphrase: string,
  blockchain: BlockchainCode,
): Promise<SignedTx> {
  log.debug(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${blockchain} blockchain`);

  let gasPrices: Record<'gasPrice', string> | Record<'maxGasPrice' | 'priorityGasPrice', string>;

  if (tx.gasPrice == null) {
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
    nonce: typeof tx.nonce === 'string' ? parseInt(tx.nonce) : tx.nonce,
    to: tx.to,
    value: typeof tx.value === 'string' ? tx.value : tx.value.toString(),
  };

  return vault.signTx(accountId, unsignedTx, passphrase);
}

export interface SignData {
  blockchain: BlockchainCode;
  entryId: string;
  signed: string;
  tx: EthereumTransaction | UnsignedBitcoinTx;
  txId: string;
}

export function signTransaction(
  accountId: string,
  blockchain: BlockchainCode,
  from: string,
  passphrase: string,
  to: string,
  gas: number,
  value: Wei,
  data: string,
  gasPrice?: Wei,
  maxGasPrice?: Wei,
  priorityGasPrice?: Wei,
  nonce: number | string = '',
): Dispatched<SignData> {
  const originalTx: EthereumTransaction = {
    blockchain,
    data,
    from,
    gas,
    nonce,
    to,
    gasPrice: gasPrice?.number,
    maxGasPrice: maxGasPrice?.number,
    priorityGasPrice: priorityGasPrice?.number,
    value: value.number,
  };

  return (dispatch: any, getState, extra) => {
    const callSignTx = (tx: EthereumTransaction): Promise<SignData> =>
      signTx(extra.api.vault, accountId, tx, passphrase, blockchain)
        .then(({ raw, txid }) => verifySender(from)(txid, raw, blockchain))
        .then(({ raw: signed, txid: txId }) => ({ blockchain, tx, txId, signed, entryId: accountId }));

    if (nonce.toString().length > 0) {
      return callSignTx(originalTx);
    }

    return extra.backendApi
      .getNonce(blockchain, from)
      .then(withNonce(originalTx))
      .then(callSignTx)
      .catch(catchError(dispatch));
  };
}

export function signBitcoinTransaction(
  entryId: EntryId,
  tx: UnsignedBitcoinTx,
  password: string,
  handler: (txid: string | null, raw: string | null, err?: string) => void,
): Dispatched<any> {
  return (dispatch: any, getState, extra) => {
    extra.api.vault
      .signTx(entryId, tx, password)
      .then(({ raw, txid }) => handler(txid, raw))
      .catch((err) => {
        handler(null, null, 'Internal error. ' + err?.message);
        dispatch(showError(err));
      });
  };
}

export interface BroadcastData extends SignData {
  fee: BigAmount;
  tokenAmount?: BigAmount;
}

export function broadcastTx({
  blockchain,
  entryId,
  fee,
  signed,
  tokenAmount,
  tx,
  txId,
}: BroadcastData): Dispatched<void> {
  return async (dispatch, getState, extra) => {
    try {
      await extra.backendApi.broadcastSignedTx(blockchain, signed);

      let changes: PersistentState.Change[] = [];

      const feeChange = {
        asset: fee.units.top.code as AnyCoinCode,
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

        let asset: AnyCoinCode;

        if (ethereumTx.to == null) {
          asset = blockchain === BlockchainCode.ETC ? 'ETC' : 'ETH';
        } else {
          const token = registry.byAddress(blockchain, ethereumTx.to);

          if (token == null) {
            asset = 'ETH';
          } else {
            asset = token.symbol;
          }
        }

        const amount = tokenAmount?.number.toString() ?? ethereumTx.value.toString();

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

      const transaction = await extra.api.txHistory.submit({
        changes,
        txId,
        blockchain: blockchainCodeToId(blockchain),
        sinceTimestamp: new Date(),
        state: State.SUBMITTED,
        status: Status.UNKNOWN,
      });

      const wallet = findWalletByEntryId(getState(), entryId);

      if (wallet != null) {
        await dispatch(updateTransaction(wallet.id, transaction, null));
      }

      dispatch(gotoScreen(Pages.TX_DETAILS, new StoredTransaction(transaction, null)));
    } catch (exception) {
      dispatch(showError(exception));
    }
  };
}

type Tx = {
  gas: BigNumber;
  to: string;
  data?: string;
  from?: string;
  value?: BigAmount;
};

export function estimateGas(chain: BlockchainCode, tx: Tx): Dispatched<any> {
  const { data, from, gas, to, value } = tx;

  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.backendApi.estimateTxCost(chain, {
      data,
      from,
      to,
      gas: `0x${gas.toString(16)}`,
      value: `0x${value?.number.toString(16) ?? 0}`,
    });
  };
}

export function estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode) {
  return (dispatch: any, getState: any, extra: IExtraArgument) => {
    return extra.backendApi.estimateFee(blockchain, blocks, mode);
  };
}

function sortBigNumber(first: BigNumber, second: BigNumber): number {
  if (first.eq(second)) {
    return 0;
  }

  return first.gt(second) ? 1 : -1;
}

export function getFee(blockchain: BlockchainCode, defaultFee: DefaultFee): Dispatched<FeePrices> {
  return async (dispatch: any) => {
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

      let expect: GasPriceType;
      let max: GasPriceType;
      let priority: GasPriceType;

      if (typeof value === 'string') {
        ({ expect, max, priority } = { ...DEFAULT_FEE, expect: value });
      } else {
        ({ expect, max, priority } = value);
      }

      return {
        expect: new BigNumber(expect),
        max: new BigNumber(max),
        priority: new BigNumber(priority),
      };
    });

    let { expects, highs, priorities } = [avgLast, avgTail5, avgMiddle].reduce<PriceSort>(
      (carry, item) => ({
        expects: [...carry.expects, item.expect],
        highs: [...carry.highs, item.max],
        priorities: [...carry.priorities, item.priority],
      }),
      {
        expects: [],
        highs: [],
        priorities: [],
      },
    );

    expects = expects.sort(sortBigNumber);
    highs = highs.sort(sortBigNumber);
    priorities = priorities.sort(sortBigNumber);

    [avgLast, avgTail5, avgMiddle] = expects.reduce<Array<GasPrices<BigNumber>>>(
      (carry, item, index) => [
        ...carry,
        {
          expect: item,
          max: highs[index],
          priority: priorities[index],
        },
      ],
      [],
    );

    if (avgTail5.expect.eq(0) && avgTail5.max.eq(0)) {
      return {
        avgLast: {
          expect: defaultFee.min,
          max: defaultFee.min,
          priority: defaultFee.priority_min ?? 0,
        },
        avgMiddle: {
          expect: defaultFee.max,
          max: defaultFee.max,
          priority: defaultFee.priority_max ?? 0,
        },
        avgTail5: {
          expect: defaultFee.std,
          max: defaultFee.std,
          priority: defaultFee.priority_std ?? 0,
        },
      };
    }

    return {
      avgLast: {
        expect: avgLast.expect.toNumber(),
        max: avgLast.max.toNumber(),
        priority: avgLast.priority.toNumber(),
      },
      avgMiddle: {
        expect: avgMiddle.expect.toNumber(),
        max: avgMiddle.max.toNumber(),
        priority: avgMiddle.priority.toNumber(),
      },
      avgTail5: {
        expect: avgTail5.expect.toNumber(),
        max: avgTail5.max.toNumber(),
        priority: avgTail5.priority.toNumber(),
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
      maxGasPrice: rawTx.maxGasPrice == null ? undefined : toBigNumber(rawTx.maxGasPrice),
      priorityGasPrice: rawTx.priorityGasPrice == null ? undefined : toBigNumber(rawTx.priorityGasPrice),
      hash: rawTx.hash,
      nonce: parseInt(rawTx.nonce, 16),
      to: rawTx.to,
      value: toBigNumber(rawTx.value),
    };
  };
}

export function setXPubCurrentIndex(xpub: string, position: number): Dispatched<void> {
  return (dispatch, getState, extra) => extra.api.xPubPos.setCurrentAddressAt(xpub, position);
}

export function getXPubLastIndex(blockchain: BlockchainCode, xpub: string, start: number): Dispatched<number> {
  return (dispatch, getState, extra) => extra.backendApi.getXPubLastIndex(blockchain, xpub, start);
}
