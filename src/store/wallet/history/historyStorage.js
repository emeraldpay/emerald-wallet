// @flow
import { convert } from '@emeraldplatform/emerald-js';
import type { Transaction } from './types';

const { toBigNumber } = convert;

/**
 * Store transaction as JSON in localStorage
 */
export function storeTransactions(key: string, txs: Array<Transaction>): void {
  if (localStorage) {
    localStorage.setItem(key, JSON.stringify(txs));
  }
}

/**
 * Restore transaction from JSON stored in localStorage
 */
export function loadTransactions(key: string): Array<Transaction> {
  if (localStorage) {
    // check old history
    // Will be removed after stable release
    let txs = [];
    const old = localStorage.getItem('trackedTransactions');
    if (old) {
      txs = JSON.parse(old);
      localStorage.removeItem('trackedTransactions');
    } else {
      const storedTxs: ?string = localStorage.getItem(key);
      if (storedTxs) {
        txs = JSON.parse(storedTxs);
      }
    }
    return txs.map(restoreTx);
  }
  return [];
}

/**
 * Converts parsed JSON object to typed Transaction object
 */
function restoreTx(tx): Transaction {
  return {
    value: (tx.value && typeof tx.value === 'string') ? toBigNumber(tx.value) : null,
    hash: tx.hash,
    input: tx.input,
    gasPrice: (tx.gasPrice && typeof tx.gasPrice === 'string') ? toBigNumber(tx.gasPrice) : null,
    gas: tx.gas,
    to: tx.to,
    from: tx.from,
    nonce: tx.nonce,
    data: tx.data,
    blockHash: tx.blockHash,
    blockNumber: tx.blockNumber,
    timestamp: tx.timestamp,
  };
}
