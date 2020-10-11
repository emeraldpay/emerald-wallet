import { convert } from '@emeraldplatform/core';
import { blockchainById, IStoredTransaction, utils } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
const { toBigNumber } = convert;

/**
 * Store transaction as JSON in localStorage
 * @deprecated remove after 3.x release
 */
export function storeTransactions (key: string, txs: IStoredTransaction[]): void {
  if (localStorage) {
    localStorage.setItem(key, JSON.stringify(txs));
  }
}

/**
 * @deprecated remove after 3.x release
 */
export function removeTransactions (key: string): void {
  if (localStorage) {
    localStorage.removeItem(key);
  }
}

/**
 * Restore transaction from JSON stored in localStorage
 * @deprecated remove after 3.x release
 */
export function loadTransactions (key: string, chainId: number): IStoredTransaction[] {
  if (localStorage) {
    // check old history
    // Will be removed after stable release
    let txs = [];
    const old = localStorage.getItem('trackedTransactions');
    if (old) {
      txs = JSON.parse(old);
      localStorage.removeItem('trackedTransactions');
    } else {
      const storedTxs = localStorage.getItem(key);
      if (storedTxs) {
        txs = JSON.parse(storedTxs);
      }
    }
    return txs
      .map((t: any) => ({
        ...t,
        chainId: t.chainId || chainId
      }))
      .map(restoreTx);
  }
  return [];
}

/**
 * Converts parsed JSON object to typed Transaction object
 */
function restoreTx (tx: any): IStoredTransaction {
  return {
    ...tx,
    value: (tx.value && typeof tx.value === 'string') ? toBigNumber(tx.value) : new BigNumber(0),
    gasPrice: (tx.gasPrice && typeof tx.gasPrice === 'string') ? toBigNumber(tx.gasPrice) : new BigNumber(0),
    timestamp: utils.parseDate(tx.timestamp, undefined),
    blockchain: tx.blockchain || (blockchainById(tx.chainId) ? blockchainById(tx.chainId)!.params.code : null),
    since: utils.parseDate(tx.since, new Date()),
    discarded: tx.discarded || false,
  };
}
