import { Satoshi, Wei } from '@emeraldpay/bigamount-crypto';
import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode, isBitcoin, isEthereum } from '@emeraldwallet/core';
import { Direction } from '@emeraldwallet/core/lib/persisistentState';
import { IState } from '../types';
import { StoredTransaction } from './types';

export function getTransactions(state: IState, entries: WalletEntry[]): StoredTransaction[] {
  const entryIds = entries.map((entry) => entry.id);

  return state.history.transactions.filter((tx) =>
    tx.changes
      .map((change) => change.wallet)
      .filter<string>((wallet): wallet is string => wallet != null)
      .reduce<boolean>((carry, wallet) => carry || entryIds.includes(wallet), false),
  );
}

export function filterTransactions(
  entries: WalletEntry[],
  transactions: StoredTransaction[],
  filter: string,
): StoredTransaction[] {
  if (filter === 'ALL') {
    return transactions;
  }

  return transactions.filter((tx) => {
    if (filter === 'OUT') {
      return tx.changes
        .filter((item) => item.direction === Direction.SPEND)
        .some((item) => entries.some((entry) => entry.id === item.wallet));
    }

    if (filter === 'IN') {
      return tx.changes
        .filter((item) => item.direction === Direction.EARN)
        .some((item) => entries.some((entry) => entry.id === item.wallet));
    }

    return false;
  });
}

export function searchTransactions(
  transactions: StoredTransaction[],
  search: string,
): StoredTransaction[] {
  const searchValue = search.toLowerCase();

  return transactions.filter((tx: StoredTransaction) => {
    const blockchainCode = blockchainIdToCode(tx.blockchain);

    return (
      tx.txId.toLowerCase().includes(searchValue) ||
      tx.changes.reduce<boolean>((carry, { address, amountValue: amount }) => {
        let blockchainAmount: null | number = null;

        if (isBitcoin(blockchainCode)) {
          blockchainAmount = new Satoshi(amount ?? 0).toBitcoin();
        } else if (isEthereum(blockchainCode)) {
          blockchainAmount = new Wei(amount ?? 0).toEther();
        }

        return (
          carry ||
          address?.toLowerCase().includes(searchValue) ||
          amount?.number.toString().toLowerCase().includes(searchValue) ||
          (blockchainAmount?.toString().toLowerCase().includes(searchValue) ?? false)
        );
      }, false)
    );
  });
}
