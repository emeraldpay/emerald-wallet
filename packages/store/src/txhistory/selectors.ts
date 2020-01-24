import { Units, Wei } from '@emeraldplatform/eth';
import { List, Map } from 'immutable';
import { createSelector } from 'reselect';
import { TransactionMap, TransactionsList } from './types';

export function allTrackedTxs (state: any): List<Map<string, any>> {
  return state.wallet.history.get('trackedTransactions');
}

export function selectByHash (state: any, hash: string): Map<string, any> {
  return allTrackedTxs(state)
    .find((tx: any) => tx.get('hash') === hash);
}

export function searchTransactions (searchValue: string, transactionsToSearch: TransactionsList): TransactionsList {
  if (transactionsToSearch.size === 0) {
    return transactionsToSearch;
  }
  const fieldsToCheck = ['to', 'from', 'hash', 'value'];
  return transactionsToSearch.filter((tx: TransactionMap | undefined) => {
    if (!tx) {
      return false;
    }
    const found = fieldsToCheck.find((field) => {
      // search for amount
      if (field === 'value') {
        const val = tx.get('value');
        const txValue = new Wei(val);
        if (!txValue) {
          return false;
        }
        return txValue.toString(Units.WEI).includes(searchValue) || txValue.toString(Units.ETHER, 18).includes(searchValue);
      }
      // search for field
      return tx.get(field) && tx.get(field).includes(searchValue);
    });
    return typeof found !== 'undefined';
  }).toList();
}

const getFieldForFilter = (txFilter: string) => {
  if (txFilter === 'IN') {
    return 'to';
  }
  if (txFilter === 'OUT') {
    return 'from';
  }
  return 'unknown';
};

export function filterTransactions (
  filterValue: string, accountId: string | null, transactionsToFilter: TransactionsList, accounts: List<Map<string, any>>
): TransactionsList {
  if (filterValue === 'ALL') {
    return transactionsToFilter;
  }
  const fieldToFilter = getFieldForFilter(filterValue);
  const filterAddresses: string[] = accountId ? [accountId] : accounts.map((acc: any) => acc.get('id')).toJS();
  return transactionsToFilter.filter((tx: TransactionMap | undefined) => {
    if (typeof tx === 'undefined') {
      return false;
    }
    const txAddress = tx.get(fieldToFilter).toLowerCase();
    const found = filterAddresses.find((address) => txAddress === address.toLowerCase());
    return typeof found !== 'undefined';
  }).toList();
}
