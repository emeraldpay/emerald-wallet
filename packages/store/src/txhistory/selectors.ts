import {List, Map} from 'immutable';
import {IState} from '../types';
import {TransactionMap, TransactionsList} from './types';
import {WalletEntry, WalletOp, AddressRefOp} from "@emeraldpay/emerald-vault-core";
import {Wei} from '@emeraldpay/bigamount-crypto';
import {IStoredTransaction} from "@emeraldwallet/core";

export function allTrackedTxs(state: IState): IStoredTransaction[] {
  return state.history.get('trackedTransactions')
    .toJS();
}

export function selectByHash(state: IState, hash: string): IStoredTransaction | undefined {
  return allTrackedTxs(state)
    .find((tx) => tx.hash === hash);
}

function equalAddresses(a: string | undefined, b: string | undefined): boolean {
  return a != undefined && b != undefined && a.toLowerCase() === b.toLowerCase();
}

/**
 * Returns transactions which contain accounts from wallet
 * @param state
 * @param walletAccounts
 */
export function getTransactions(state: IState, walletAccounts: WalletEntry[]): IStoredTransaction[] {
  return allTrackedTxs(state)
    .filter((tx) =>
      walletAccounts
        .filter((a) => a.address)
        .map((a) => AddressRefOp.of(a.address!))
        .some((a) => a.isSame(tx.from) || (tx.to && a.isSame(tx.to)))
    );
}

export function searchTransactions(searchValue: string, transactionsToSearch: IStoredTransaction[]): IStoredTransaction[] {
  if (transactionsToSearch.length === 0) {
    return transactionsToSearch;
  }
  const fieldsToCheck = ['to', 'from', 'hash', 'value'];
  return transactionsToSearch.filter((tx: IStoredTransaction | undefined) => {
    if (!tx) {
      return false;
    }
    const found = fieldsToCheck.find((field) => {
      // search for amount
      if (field === 'value') {
        const val = tx.value;
        const txValue = new Wei(val);
        if (!txValue) {
          return false;
        }
        return txValue.number.toFixed().includes(searchValue)
          || txValue.toEther().toString().includes(searchValue);
      }
      // search for field
      // @ts-ignore
      const fieldValue: string | undefined = tx[field];
      return typeof fieldValue != "undefined" && fieldValue.includes(searchValue);
    });
    return typeof found !== 'undefined';
  });
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

export function filterTransactions(
  filterValue: string, accountId: string | null, transactionsToFilter: IStoredTransaction[], accounts: WalletEntry[]
): IStoredTransaction[] {
  if (filterValue === 'ALL') {
    return transactionsToFilter;
  }
  const fieldToFilter = getFieldForFilter(filterValue);
  // @ts-ignore
  const filterAddresses: string[] = accounts.map((acc) => acc.address?.value)
    .filter((a) => typeof a !== "undefined");
  return transactionsToFilter.filter((tx: IStoredTransaction | undefined) => {
    if (typeof tx === 'undefined') {
      return false;
    }
    // @ts-ignore
    const txAddress = tx[fieldToFilter].toLowerCase();
    const found = filterAddresses.find((address) => txAddress === address.toLowerCase());
    return typeof found !== 'undefined';
  });
}
