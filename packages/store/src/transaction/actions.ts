import { EstimationMode } from '@emeraldpay/api';
import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { UnsignedTx } from '@emeraldpay/emerald-vault-core';
import { EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core/lib/types';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core/lib/vault';
import {
  BlockchainCode,
  Blockchains,
  EthereumAddress,
  EthereumReceipt,
  EthereumTransaction,
  EthereumTx,
  Logger,
  quantitiesToHex,
  toBigNumber,
} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { Pages } from '../screen';
import { catchError, gotoScreen, showError } from '../screen/actions';
import {
  DEFAULT_FEE,
  Dispatched,
  FEE_KEYS,
  FeePrices,
  GasPriceType,
  GasPrices,
  IExtraArgument,
  PriceSort,
} from '../types';

const log = Logger.forCategory('store.transaction');

function unwrap(value: string[] | string | null): Promise<string> {
  return new Promise((resolve, reject) => {
    const [data] = Array.isArray(value) ? value : [value];

    if (typeof data === 'string') {
      return resolve(data);
    }

    reject(new Error(`Invalid value ${value}`));
  });
}

function withNonce(tx: EthereumTransaction): (nonce: number) => Promise<EthereumTransaction> {
  return (nonce) => new Promise((resolve) => resolve({ ...tx, nonce: quantitiesToHex(nonce) }));
}

function verifySender(expected: string): (a: string, c: BlockchainCode) => Promise<string> {
  return (raw: string, chain: BlockchainCode) =>
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
          resolve(raw);
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
): Promise<string | string[]> {
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
): Dispatched<any> {
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
    const callSignTx = (tx: EthereumTransaction): Promise<any> =>
      signTx(extra.api.vault, accountId, tx, passphrase, blockchain)
        .then(unwrap)
        .then((rawTx) => verifySender(from)(rawTx, blockchain))
        .then((signed) => ({ tx, signed }));

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
  handler: (raw?: string, err?: string) => void,
): Dispatched<any> {
  return (dispatch: any, getState, extra) => {
    extra.api.vault
      .signTx(entryId, tx, password)
      .then((raw) => handler(raw))
      .catch((err) => {
        handler(undefined, 'Internal error. ' + err?.message);
        dispatch(showError(err));
      });
  };
}

export function broadcastTx(chain: BlockchainCode, signedTx: string): Dispatched<void> {
  return async (dispatch, getState, extra) => {
    try {
      const hash = await extra.backendApi.broadcastSignedTx(chain, signedTx);

      const state = getState();

      dispatch(
        gotoScreen(
          Pages.TX_DETAILS,
          state.history.transactions.find((tx) => tx.txId === hash),
        ),
      );
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

export function getFee(blockchain: BlockchainCode): Dispatched<FeePrices> {
  return async (dispatch: any) => {
    let results = await Promise.allSettled(FEE_KEYS.map((key) => dispatch(estimateFee(blockchain, 128, key))));

    results = await Promise.allSettled(
      results.map((result, index) =>
        result.status === 'fulfilled'
          ? Promise.resolve(result.value)
          : dispatch(estimateFee(blockchain, 256, FEE_KEYS[index])),
      ),
    );

    let [avgLastNumber, avgTail5Number, avgMiddleNumber] = results.map((result) => {
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

    let { expects, highs, priorities } = [avgLastNumber, avgTail5Number, avgMiddleNumber].reduce<PriceSort>(
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

    [avgLastNumber, avgTail5Number, avgMiddleNumber] = expects.reduce<Array<GasPrices<BigNumber>>>(
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

    if (avgTail5Number.expect.eq(0) && avgTail5Number.max.eq(0)) {
      // TODO Set default value from remote config
      avgTail5Number = {
        expect: new Wei(30, 'GWei').number,
        max: new Wei(30, 'GWei').number,
        priority: new Wei(1, 'GWei').number,
      };
    }

    const avgLastExpect = avgLastNumber.expect.gt(0)
      ? avgLastNumber.expect.toNumber()
      : avgTail5Number.expect.minus(avgTail5Number.expect.multipliedBy(0.25)).toNumber();
    const avgLastMax = avgLastNumber.max.gt(0)
      ? avgLastNumber.max.toNumber()
      : avgTail5Number.max.minus(avgTail5Number.max.multipliedBy(0.25)).toNumber();
    const avgLastPriority = avgLastNumber.priority.gt(0)
      ? avgLastNumber.priority.toNumber()
      : avgTail5Number.priority.minus(avgTail5Number.priority.multipliedBy(0.25)).toNumber();

    const avgMiddleExpect = avgMiddleNumber.expect.gt(0)
      ? avgMiddleNumber.expect.toNumber()
      : avgTail5Number.expect.plus(avgTail5Number.expect.multipliedBy(0.25)).toNumber();
    const avgMiddleMax = avgMiddleNumber.max.gt(0)
      ? avgMiddleNumber.max.toNumber()
      : avgTail5Number.max.plus(avgTail5Number.max.multipliedBy(0.25)).toNumber();
    const avgMiddlePriority = avgMiddleNumber.priority.gt(0)
      ? avgMiddleNumber.priority.toNumber()
      : avgTail5Number.priority.plus(avgTail5Number.priority.multipliedBy(0.25)).toNumber();

    return {
      avgLast: {
        expect: avgLastExpect,
        max: avgLastMax,
        priority: avgLastPriority,
      },
      avgMiddle: {
        expect: avgMiddleExpect,
        max: avgMiddleMax,
        priority: avgMiddlePriority,
      },
      avgTail5: {
        expect: avgTail5Number.expect.toNumber(),
        max: avgTail5Number.max.toNumber(),
        priority: avgTail5Number.priority.toNumber(),
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

export function setXPubIndex(xpub: string, position: number): Dispatched<void> {
  return (dispatch, getState, extra) => extra.api.xPubPos.setAtLeast(xpub, position);
}

export function getXPubLastIndex(blockchain: BlockchainCode, xpub: string): Dispatched<number> {
  return (dispatch, getState, extra) => extra.backendApi.getXPubLastIndex(blockchain, xpub);
}
