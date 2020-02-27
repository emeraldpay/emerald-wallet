import { Units, Wei } from '@emeraldplatform/eth';
import { List, Map } from 'immutable';
import { createSelector } from 'reselect';
import { IState } from '../types';
import { TransactionMap, TransactionsList } from './types';

export function allTrackedTxs (state: IState): List<Map<string, any>> {
  return state.history.get('trackedTransactions');
}

export function selectByHash (state: IState, hash: string): Map<string, any> {
  return allTrackedTxs(state)
    .find((tx: any) => tx.get('hash') === hash);
}

const equalAddresses = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
/**
 * Returns transactions which contain accounts from wallet
 * @param state
 * @param walletAccounts
 */
export function getTransactions (state: IState, walletAccounts: any[]): TransactionsList {
  return allTrackedTxs(state)
    .filter((tx: any) =>
      walletAccounts.some((a) =>
        equalAddresses(a.address, tx.get('from')) || equalAddresses(a.address, tx.get('to'))))
    .toList();
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
        return txValue.toString(Units.WEI).includes(searchValue)
          || txValue.toString(Units.ETHER, 18).includes(searchValue);
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
  filterValue: string, accountId: string | null, transactionsToFilter: TransactionsList, accounts: any[]
): TransactionsList {
  if (filterValue === 'ALL') {
    return transactionsToFilter;
  }
  const fieldToFilter = getFieldForFilter(filterValue);
  const filterAddresses: string[] = accounts.map((acc: any) => acc.address);
  return transactionsToFilter.filter((tx: TransactionMap | undefined) => {
    if (typeof tx === 'undefined') {
      return false;
    }
    const txAddress = tx.get(fieldToFilter).toLowerCase();
    const found = filterAddresses.find((address) => txAddress === address.toLowerCase());
    return typeof found !== 'undefined';
  }).toList();
}
