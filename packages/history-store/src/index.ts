import { BlockchainCode, IStoredTransaction } from '@emeraldwallet/core';
import TxStore from './TxStore';

export { loadTransactions, storeTransactions, removeTransactions } from './local-storage/historyStorage';

const DEFAULT_WALLET_ID = 'wallet0';

export function loadTransactions2 (network: BlockchainCode): IStoredTransaction[] {
  const store = new TxStore(DEFAULT_WALLET_ID, network);
  return store.load();
}

export function storeTransactions2 (network: BlockchainCode, txs: IStoredTransaction[]): void {
  const store = new TxStore(DEFAULT_WALLET_ID, network);
  store.save(txs);
}
