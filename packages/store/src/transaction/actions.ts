import { EstimationMode } from '@emeraldpay/api';
import { BigAmount, CreateAmount } from '@emeraldpay/bigamount';
import { Satoshi } from '@emeraldpay/bigamount-crypto';
import {
  BitcoinEntry,
  EntryId,
  IEmeraldVault,
  SignedTx,
  UnsignedBasicEthereumTx,
  UnsignedBitcoinTx,
  UnsignedEIP1559EthereumTx,
  UnsignedTx,
  isBitcoinEntry,
} from '@emeraldpay/emerald-vault-core';
import {
  BitcoinRawTransaction,
  BitcoinRawTransactionInput,
  BlockchainCode,
  Blockchains,
  EthereumAddress,
  EthereumBasicTransaction,
  EthereumReceipt,
  EthereumTransaction,
  EthereumTransactionType,
  EthereumTx,
  InputUtxo,
  Logger,
  PersistentState,
  TokenRegistry,
  amountDecoder,
  amountFactory,
  blockchainCodeToId,
  blockchainIdToCode,
  isBitcoin,
  isEthereum,
  toHex,
  workflow,
} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { IState, application } from '..';
import { findEntry, findWalletByEntryId } from '../accounts/selectors';
import { Pages } from '../screen';
import { gotoScreen, showError } from '../screen/actions';
import { IErrorAction, IOpenAction } from '../screen/types';
import { updateTransaction } from '../txhistory/actions';
import { StoredTransaction, UpdateStoredTxAction } from '../txhistory/types';
import { Dispatched } from '../types';
import {
  BroadcastData,
  DEFAULT_FEE,
  FEE_KEYS,
  FeePrices,
  GasPriceType,
  GasPrices,
  PriceSort,
  SignData,
  SignHandler,
} from './types';

const { Direction, ChangeType, State, Status } = PersistentState;

const log = Logger.forCategory('Store::Transaction');

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
        direction: Direction.EARN,
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
          const asset = tokenAmount.token.address;

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

      dispatch(
        gotoScreen(
          Pages.TX_DETAILS,
          { entryId, tx: new StoredTransaction(tokenRegistry, transaction, null) },
          null,
          true,
        ),
      );
    } catch (exception) {
      if (exception instanceof Error) {
        const transaction = getState().history.transactions.find((tx) => tx.txId === txId);

        dispatch(showError(exception, transaction));
      }
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Dispatched<any> {
  return (dispatch, getState, extra) => {
    return extra.backendApi.estimateFee(blockchain, blocks, mode);
  };
}

export function estimateGas(blockchain: BlockchainCode, tx: EthereumTransaction): Dispatched<number> {
  return (dispatch, getState, extra) => {
    const { data, from, gasPrice, maxGasPrice, priorityGasPrice, to, type, value } = tx;

    if (to == null) {
      return -1;
    }

    const basicTx: EthereumBasicTransaction = { data, from, to, value: toHex(value.number) };

    if (type === EthereumTransactionType.EIP1559) {
      basicTx.maxFeePerGas = toHex(maxGasPrice?.number);
      basicTx.maxPriorityFeePerGas = toHex(priorityGasPrice?.number);
    } else {
      basicTx.gasPrice = toHex(gasPrice?.number);
    }

    return extra.backendApi.estimateTxCost(blockchain, basicTx);
  };
}

function sortBigNumber(first: BigNumber, second: BigNumber): number {
  if (first.eq(second)) {
    return 0;
  }

  return first.gt(second) ? 1 : -1;
}

/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export function getFee(blockchain: BlockchainCode): Dispatched<FeePrices<GasPrices>> {
  return async (dispatch, getState, extra) => {
    let results = await Promise.allSettled(FEE_KEYS.map((key) => extra.backendApi.estimateFee(blockchain, 128, key)));

    results = await Promise.allSettled(
      results.map((result, index) =>
        result.status === 'fulfilled'
          ? Promise.resolve(result.value)
          : extra.backendApi.estimateFee(blockchain, 256, FEE_KEYS[index]),
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

    if (avgMiddle.max.eq(0)) {
      const defaultFee = application.selectors.getDefaultFee(getState(), blockchain);

      const defaults = {
        avgLast: {
          max: defaultFee?.min ?? '0',
          priority: defaultFee?.priority_min ?? '0',
        },
        avgMiddle: {
          max: defaultFee?.max ?? '0',
          priority: defaultFee?.priority_max ?? '0',
        },
        avgTail5: {
          max: defaultFee?.std ?? '0',
          priority: defaultFee?.priority_std ?? '0',
        },
      };

      const cachedFee = await extra.api.cache.get(`fee.${blockchain}`);

      if (cachedFee == null) {
        return defaults;
      }

      try {
        return JSON.parse(cachedFee);
      } catch (exception) {
        return defaults;
      }
    }

    const fee = {
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

    await extra.api.cache.put(
      `fee.${blockchain}`,
      JSON.stringify(fee),
      application.selectors.getFeeTtl(getState(), blockchain),
    );

    return fee;
  };
}

/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export function getBtcTx(blockchain: BlockchainCode, hash: string): Dispatched<BitcoinRawTransaction | null> {
  return async (dispatch, getState, extra) => {
    const rawTx = await extra.backendApi.getBtcTx(blockchain, hash);

    if (rawTx == null) {
      return null;
    }

    return rawTx;
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

/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export function getEthTx(blockchain: BlockchainCode, hash: string): Dispatched<EthereumTransaction | null> {
  return async (dispatch, getState, extra) => {
    const rawTx = await extra.backendApi.getEthTx(blockchain, hash);

    if (rawTx == null) {
      return null;
    }

    const factory = amountFactory(blockchain);

    return {
      blockchain,
      blockNumber: rawTx.blockNumber == null ? undefined : parseInt(rawTx.blockNumber, 16),
      data: rawTx.input,
      from: rawTx.from,
      gas: parseInt(rawTx.gas, 16),
      gasPrice: rawTx.gasPrice == null ? undefined : factory(rawTx.gasPrice),
      maxGasPrice: rawTx.maxFeePerGas == null ? undefined : factory(rawTx.maxFeePerGas),
      priorityGasPrice: rawTx.maxPriorityFeePerGas == null ? undefined : factory(rawTx.maxPriorityFeePerGas),
      hash: rawTx.hash,
      nonce: parseInt(rawTx.nonce, 16),
      to: rawTx.to,
      type: parseInt(rawTx.type, 16) === 2 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
      value: factory(rawTx.value),
    };
  };
}

export function getNonce(blockchain: BlockchainCode, from: string): Dispatched<number> {
  return (dispatch, getState, extra) => extra.backendApi.getNonce(blockchain, from);
}

export function getTopFee(blockchain: BlockchainCode): Dispatched<GasPrices> {
  return async (dispatch, getState, extra) => {
    let avgTop: GasPrices = await extra.backendApi.estimateFee(blockchain, 128, 'avgTop');

    if (avgTop == null) {
      avgTop = await extra.backendApi.estimateFee(blockchain, 128, 'avgMiddle');
    }

    const defaultFee = application.selectors.getDefaultFee<string>(getState(), blockchain);

    const defaults: GasPrices = {
      max: defaultFee?.max ?? '0',
      priority: defaultFee?.priority_max ?? '0',
    };

    if (avgTop == null) {
      const cachedFee = await extra.api.cache.get(`fee.${blockchain}`);

      if (cachedFee == null) {
        return defaults;
      }

      try {
        ({ avgTop } = JSON.parse(cachedFee));
      } catch (exception) {
        // Nothing
      }
    }

    return avgTop ?? defaults;
  };
}

export function getXPubLastIndex(
  blockchain: BlockchainCode,
  xpub: string,
  start: number,
): Dispatched<number | undefined> {
  return (dispatch, getState, extra) => extra.backendApi.getXPubLastIndex(blockchain, xpub, start);
}

export function setXPubCurrentIndex(xpub: string, position: number): Dispatched {
  return (dispatch, getState, extra) => extra.api.xPubPos.setCurrentAddressAt(xpub, position);
}

/**
 * @deprecated Should be replaced by unified logic in new UI
 */
export function signBitcoinTransaction(
  entryId: EntryId,
  tx: UnsignedBitcoinTx,
  password: string | undefined,
  handler: SignHandler,
): Dispatched {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (dispatch: any, getState, extra) => {
    try {
      const { raw, txid } = await extra.api.vault.signTx(entryId, tx, password);

      const entry = findEntry(getState(), entryId);

      if (entry != null && isBitcoinEntry(entry)) {
        const changeXPub = entry.xpub.find(({ role }) => role === 'change');

        if (changeXPub != null) {
          const index = await extra.api.xPubPos.getNext(changeXPub.xpub);
          const [{ address: changeAddress }] = await extra.api.vault.listEntryAddresses(entryId, 'change', index, 1);

          const output = tx.outputs.find(({ address }) => address === changeAddress);

          if (output != null) {
            await extra.api.xPubPos.setCurrentAddressAt(changeXPub.xpub, index);
          }
        }
      }

      handler(txid, raw);
    } catch (exception) {
      if (exception instanceof Error) {
        dispatch(showError(exception));
      }

      handler(null, null);
    }
  };
}

function signEthTx(
  entryId: string,
  tx: EthereumTransaction,
  vault: IEmeraldVault,
  password: string | undefined,
): Promise<SignedTx> {
  log.debug(`Calling emerald api to sign tx from ${tx.from} to ${tx.to} in ${tx.blockchain} blockchain`);

  let gasPrices:
    | Pick<UnsignedBasicEthereumTx, 'gasPrice'>
    | Pick<UnsignedEIP1559EthereumTx, 'maxGasPrice' | 'priorityGasPrice'>;

  if (tx.type === EthereumTransactionType.EIP1559) {
    gasPrices = {
      maxGasPrice: tx.maxGasPrice?.number.toString() ?? '0',
      priorityGasPrice: tx.priorityGasPrice?.number.toString() ?? '0',
    };
  } else {
    gasPrices = {
      gasPrice: tx.gasPrice?.number.toString() ?? '0',
    };
  }

  const unsignedTx: UnsignedTx = {
    ...gasPrices,
    data: tx.data,
    from: tx.from,
    gas: tx.gas,
    nonce: tx.nonce ?? 0,
    to: tx.to,
    value: tx.value.number.toString(),
  };

  return vault.signTx(entryId, unsignedTx, password);
}

function verifySender(expected: string): (txid: string, raw: string, chain: BlockchainCode) => Promise<SignedTx> {
  return (txid, raw, chain) =>
    new Promise((resolve, reject) => {
      const { chainId } = Blockchains[chain].params;

      let tx;

      try {
        tx = EthereumTx.fromRaw(raw, chainId);
      } catch (exception) {
        log.error(`Failed to parse raw tx: ${raw}, chainId: ${chainId}`, exception);

        reject(new Error('Emerald Vault returned invalid signature for the transaction'));

        return;
      }

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

/**
 * @deprecated Should be replaced by unified logic in new UI
 */
export function signEthereumTransaction(
  entryId: string,
  transaction: EthereumTransaction,
  password: string | undefined,
): Dispatched<SignData | undefined> {
  return (dispatch, getState, extra) => {
    const callSignTx = (tx: EthereumTransaction): Promise<SignData> =>
      signEthTx(entryId, tx, extra.api.vault, password)
        .then(({ raw, txid }) => verifySender(tx.from)(txid, raw, tx.blockchain))
        .then(({ raw: signed, txid: txId }) => ({ entryId, signed, tx, txId, blockchain: tx.blockchain }));

    if (transaction.nonce == null) {
      return extra.backendApi
        .getNonce(transaction.blockchain, transaction.from)
        .then((nonce) => callSignTx({ ...transaction, nonce }))
        .catch((error) => {
          dispatch(showError(error));

          return undefined;
        });
    }

    return callSignTx(transaction).catch((error) => {
      dispatch(showError(error));

      return undefined;
    });
  };
}

export function signTx(unsiged: UnsignedTx, entryId: EntryId, password?: string): Dispatched<SignedTx> {
  return (dispatch, getState, extra) => extra.api.vault.signTx(entryId, unsiged, password);
}

function getBtcTxEntries(state: IState, tx: StoredTransaction): BitcoinEntry[] {
  const entryById = tx.changes
    .filter(({ direction }) => direction === Direction.SPEND)
    .map(({ wallet }) => wallet)
    .filter((entryId): entryId is EntryId => entryId != null)
    .map((entryId) => findEntry(state, entryId))
    .filter((entry): entry is BitcoinEntry => entry != null && isBitcoinEntry(entry))
    .reduce<Map<EntryId, BitcoinEntry>>((carry, entry) => {
      if (carry.has(entry.id)) {
        return carry;
      }

      return carry.set(entry.id, entry);
    }, new Map());

  return [...entryById.values()];
}

interface ExtractedUtxo {
  restUtxo: InputUtxo[];
  txUtxo: InputUtxo[];
}

function extractUtxo(
  balances: PersistentState.Balance[],
  inputs: BitcoinRawTransactionInput[],
  factory: CreateAmount<BigAmount>,
): ExtractedUtxo {
  return balances
    .reduce<InputUtxo[]>(
      (carry, { address, utxo = [] }) => [
        ...carry,
        ...utxo.map(({ amount, txid, vout }) => ({
          address,
          txid,
          vout,
          value: factory(amount).encode(),
        })),
      ],
      [],
    )
    .reduce<ExtractedUtxo>(
      (carry, item) => {
        const input = inputs.find(({ txid, vout }) => txid === item.txid && vout === item.vout);

        if (input == null) {
          return { ...carry, restUtxo: [...carry.restUtxo, item] };
        }

        return { ...carry, txUtxo: [...carry.txUtxo, { ...item, sequence: input.sequence }] };
      },
      { restUtxo: [], txUtxo: [] },
    );
}

/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export function restoreBtcTx(
  rawTx: BitcoinRawTransaction,
  tx: StoredTransaction,
  cancel = false,
): Dispatched<workflow.BitcoinTx> {
  return async (dispatch, getState, extra) => {
    const entries = getBtcTxEntries(getState(), tx);

    if (entries.length === 0) {
      throw new Error('Entry not found');
    }

    /**
     * Currently creating bitcoin transaction supports only single entry
     */
    if (entries.length > 1) {
      throw new Error('Currently support only single entry');
    }

    const balances = await Promise.all(
      entries
        .reduce<string[]>((carry, entry) => [...carry, ...entry.xpub.map(({ xpub }) => xpub)], [])
        .map((xPub) => extra.api.balances.list(xPub)),
    );

    const blockchainCode = blockchainIdToCode(tx.blockchain);

    const factory = amountFactory(blockchainCode) as CreateAmount<Satoshi>;

    const { restUtxo, txUtxo } = extractUtxo(balances.flat(), rawTx.vin, factory);

    if (rawTx.vin.length !== txUtxo.length) {
      throw new Error("Can't found all inputs in utxo");
    }

    const [entry] = entries;

    const roleIndexes = await Promise.all(
      entry.xpub.map(async ({ role, xpub }) => ({ role, index: await extra.api.xPubPos.getNext(xpub) })),
    );
    const entryAddresses = await Promise.all(
      roleIndexes.map(({ index, role }) => extra.api.vault.listEntryAddresses(entry.id, role, 0, index)),
    );

    const addresses = entryAddresses
      .flat()
      .filter(({ address }) => rawTx.vout.some(({ scriptPubKey: { address: txAddress } }) => address === txAddress));

    const outputs = rawTx.vout.filter(
      ({ scriptPubKey: { address: txAddress } }) => !addresses.some(({ address }) => address === txAddress),
    );

    if (outputs.length === 0) {
      throw new Error("Can't found receiver address");
    }

    /**
     * Currently creating bitcoin transaction supports only single output (`to` address)
     */
    if (outputs.length > 1) {
      throw new Error('Currently supported only single receiver address');
    }

    let changeAddress: string | undefined;

    if (addresses.length > 0) {
      changeAddress = addresses.find(({ role }) => role === 'change')?.address;
    }

    if (changeAddress == null) {
      const nextChangeAddresses = await Promise.all(
        roleIndexes
          .filter(({ role }) => role === 'change')
          .map(({ index, role }) => extra.api.vault.listEntryAddresses(entry.id, role, index, 1)),
      );

      [{ address: changeAddress }] = nextChangeAddresses.flat();
    }

    if (changeAddress == null) {
      throw new Error("Can't found change address");
    }

    const [
      {
        scriptPubKey: { address },
        value: amount,
      },
    ] = outputs;

    const TxClass = cancel ? workflow.CreateBitcoinCancelTx : workflow.CreateBitcoinTx;

    const restoredTx = new TxClass(
      {
        changeAddress,
        blockchain: blockchainIdToCode(entry.blockchain),
        entryId: entry.id,
      },
      [...txUtxo, ...restUtxo],
    );

    const decoder = amountDecoder<Satoshi>(blockchainCode);

    const zeroAmount = factory(0);

    const fromBitcoin = (value: number): Satoshi =>
      factory(1).multiply(zeroAmount.units.top.multiplier).multiply(value);

    const inputAmount = txUtxo.reduce((carry, { value }) => carry.plus(decoder(value)), zeroAmount);
    const outputAmount = rawTx.vout.reduce((carry, { value }) => carry.plus(fromBitcoin(value)), zeroAmount);

    restoredTx.amount = fromBitcoin(amount);
    restoredTx.to = address;

    // Fee price assign should be after any other assignments because depends on their values
    restoredTx.feePrice = restoredTx.estimateVkbPrice(inputAmount.minus(outputAmount));

    return restoredTx;
  };
}
