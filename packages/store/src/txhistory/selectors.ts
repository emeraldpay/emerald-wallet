import {IState} from '../types';
import {WalletEntry, WalletOp, AddressRefOp} from "@emeraldpay/emerald-vault-core";
import {Wei} from '@emeraldpay/bigamount-crypto';
import {
  isBitcoinStoredTransaction,
  isEthereumStoredTransaction,
  IStoredTransaction,
  BitcoinStoredTransaction
} from "@emeraldwallet/core";
import {BitcoinEntry, EntryId, isBitcoinEntry} from "@emeraldpay/emerald-vault-core";

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

  function addressReferencedByTx(address: string, tx: BitcoinStoredTransaction): boolean {
    return tx.outputs.some((it) => it.address == address)
  }

  function entryReferencedByTx(entryId: EntryId, tx: BitcoinStoredTransaction): boolean {
    return tx.inputs.some((it) => it.entryId == entryId)
  }

  return allTrackedTxs(state)
    .filter((tx) => {
      if (isEthereumStoredTransaction(tx)) {
        return walletAccounts
          .filter((a) => a.address)
          .map((a) => AddressRefOp.of(a.address!))
          .some((a) => a.isSame(tx.from) || (tx.to && a.isSame(tx.to)));
      } else if (isBitcoinStoredTransaction(tx)) {
        return walletAccounts
          .filter((a) => isBitcoinEntry(a))
          .some((entry) => {
            return entryReferencedByTx(entry.id, tx) ||
              (entry as BitcoinEntry).addresses.some((it) => addressReferencedByTx(it.address, tx))
          })
        //TODO old addresses are not available right now
      }
        return false;
      }
    );
}

export function searchTransactions(searchValue: string, transactionsToSearch: IStoredTransaction[]): IStoredTransaction[] {
  if (transactionsToSearch.length === 0) {
    return transactionsToSearch;
  }
  return transactionsToSearch.filter((tx: IStoredTransaction | undefined) => {
    if (!tx) {
      return false;
    }
    if (isEthereumStoredTransaction(tx)) {
      const fieldsToCheck = ['to', 'from', 'hash', 'value'];
      return fieldsToCheck.some((field) => {
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
        // search in other fields
        // @ts-ignore
        const fieldValue: string | undefined = tx[field];
        return typeof fieldValue != "undefined" && fieldValue.includes(searchValue);
      });
    } else if (isBitcoinStoredTransaction(tx)) {
      const foundInput = tx.inputs.some((it) =>
        it.txid.toLowerCase().includes(searchValue) ||
        it.amount.toString().includes(searchValue) ||
        it.address?.toLowerCase().includes(searchValue)
      );
      const foundOutput = tx.outputs.some((it) =>
        it.address.toLowerCase().includes(searchValue) ||
        it.amount.toString().includes(searchValue)
      )
      return foundInput || foundOutput;
    }
    return false;
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
