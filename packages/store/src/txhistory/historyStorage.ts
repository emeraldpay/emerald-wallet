import { convert } from '@emeraldplatform/core';
import {blockchainById} from "@emeraldwallet/core";
import { Transaction } from '../types';
import BigNumber from 'bignumber.js';
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
export function loadTransactions(key: string, chainId: number): Array<Transaction> {
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
        chainId: t.chainId || chainId,
      }))
      .map(restoreTx);
  }
  return [];
}

/**
 * Converts parsed JSON object to typed Transaction object
 */
function restoreTx(tx: any): Transaction {
  return {
    value: (tx.value && typeof tx.value === 'string') ? toBigNumber(tx.value) : new BigNumber(0),
    hash: tx.hash,
    input: tx.input,
    gasPrice: (tx.gasPrice && typeof tx.gasPrice === 'string') ? toBigNumber(tx.gasPrice) : new BigNumber(0),
    gas: tx.gas,
    to: tx.to,
    from: tx.from,
    nonce: tx.nonce,
    data: tx.data,
    blockHash: tx.blockHash,
    blockNumber: tx.blockNumber,
    timestamp: tx.timestamp,
    chain: tx.chain || ( blockchainById(tx.chainId) ? blockchainById(tx.chainId)!.params.code : null),
    chainId: tx.chainId,
  };
}
