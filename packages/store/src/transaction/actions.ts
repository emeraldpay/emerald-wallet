import { EstimationMode } from '@emeraldpay/api';
import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { UnsignedTx } from '@emeraldpay/emerald-vault-core';
import { EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core/lib/types';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core/lib/vault';
import {
  BitcoinStoredTransaction,
  BlockchainCode,
  Blockchains,
  EthereumAddress,
  EthereumStoredTransaction,
  EthereumTx,
  isBitcoin,
  isEthereum,
  Logger,
  quantitiesToHex,
} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { Dispatch } from 'redux';
import * as screen from '../screen';
import { catchError, gotoScreen, showError } from '../screen/actions';
import * as history from '../txhistory';
import { DEFAULT_FEE, Dispatched, FEE_KEYS, GasPrices, GasPriceType, IExtraArgument, PriceSort } from '../types';

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

/**
 * Called after Tx sent
 */
function onEthereumTxSent(
  dispatch: Dispatch<any>,
  txHash: string,
  sourceTx: EthereumStoredTransaction,
  blockchain: BlockchainCode,
): void {
  // dispatch(loadAccountBalance(sourceTx.from));
  const sentTx = { ...sourceTx, hash: txHash };

  // TODO: dependency on wallet/history module!
  dispatch(history.actions.trackTxs([sentTx], blockchain));
  dispatch(gotoScreen(screen.Pages.TX_DETAILS, sentTx));
}

function onBitcoinTxSent(
  dispatch: Dispatch<any>,
  txHash: string,
  sourceTx: UnsignedBitcoinTx,
  blockchain: BlockchainCode,
): void {
  const sentTx: BitcoinStoredTransaction = {
    blockchain,
    since: new Date(),
    hash: txHash,
    entries: sourceTx.inputs
      .map((it) => it.entryId)
      .filter((it) => typeof it != 'undefined')
      .map((it) => it!)
      .reduce((all, it) => (all.indexOf(it) >= 0 ? all : all.concat(it)), [] as string[]),
    inputs: sourceTx.inputs.map((it) => {
      return {
        txid: it.txid,
        vout: it.vout,
        amount: it.amount,
        entryId: it.entryId,
        address: it.address,
        hdPath: it.hdPath,
      };
    }),
    outputs: sourceTx.outputs,
    fee: sourceTx.fee,
  };

  // TODO: dependency on wallet/history module!
  dispatch(history.actions.trackTxs([sentTx], blockchain));
  dispatch(gotoScreen(screen.Pages.TX_DETAILS, sentTx));
}

function withNonce(tx: EthereumStoredTransaction): (nonce: number) => Promise<EthereumStoredTransaction> {
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
          log.error(`WRONG SENDER: 0x${tx.getSenderAddress().toString()} != ${expected}`);
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
  tx: EthereumStoredTransaction,
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
  const originalTx: EthereumStoredTransaction = {
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
    const callSignTx = (tx: EthereumStoredTransaction): Promise<any> => {
      return signTx(extra.api.vault, accountId, tx, passphrase, blockchain)
        .then(unwrap)
        .then((rawTx) => verifySender(from)(rawTx, blockchain))
        .then((signed) => ({ tx, signed }));
    };

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

export function broadcastTx(
  chain: BlockchainCode,
  tx: EthereumStoredTransaction | UnsignedBitcoinTx,
  signedTx: string,
): Dispatched<any> {
  return async (dispatch: any, getState: any, extra: IExtraArgument) => {
    try {
      const hash = await extra.backendApi.broadcastSignedTx(chain, signedTx);
      if (isBitcoin(chain)) {
        return onBitcoinTxSent(dispatch, hash, tx as BitcoinStoredTransaction, chain);
      } else if (isEthereum(chain)) {
        return onEthereumTxSent(dispatch, hash, tx as EthereumStoredTransaction, chain);
      }
    } catch (e) {
      dispatch(showError(e));
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
      gas: gas.toNumber(),
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

export function getFee(blockchain: BlockchainCode): Dispatched<Record<typeof FEE_KEYS[number], GasPrices>> {
  return async (dispatch: any) => {
    let results = await Promise.allSettled(
      FEE_KEYS.map((key) => dispatch(estimateFee(blockchain, 128, key))),
    );

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
