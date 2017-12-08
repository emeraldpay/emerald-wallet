import TokenUnits from '../../../lib/tokenUnits';
import { List } from 'immutable';

export const searchTransactions = (searchValue, transactionsToSearch) => {
  return transactionsToSearch.filter((tx) => {
    const fieldsToCheck = ['to', 'from', 'hash', 'value'];
    return fieldsToCheck.find((field) => {
      // search for amount
      if (field === 'value') {
        const txValue = tx.get('value') ? new TokenUnits(tx.get('value').value(), 18) : null;
        if (!txValue) {
          return false;
        }
        return txValue.getDecimalized(3).toString().includes(searchValue);
      }
      // search for field
      return tx.get(field).includes(searchValue);
    });
  });
}


const getFieldForFilter = (txFilter) => {
  if (txFilter === 'IN') {
    return 'to';
  }
  if (txFilter === 'OUT') {
    return 'from';
  }
};

export const filterTransactions = (filterValue, accountId, transactionsToFilter, accounts) => {
  const inOrOut = getFieldForFilter(filterValue);
  return transactionsToFilter.filter((tx) => {
    const accountAddress = tx.get(inOrOut);
    if (accountId) {
      return accountAddress === accountId;
    }
    return accounts.filter((account) => accountAddress === account.get('id')).size > 0;
  });
}
