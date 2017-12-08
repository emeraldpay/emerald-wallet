import TokenUnits from '../../../lib/tokenUnits';

export const searchTransactions = (searchValue, transactionsToSearch) => {
  if (transactionsToSearch.size === 0) {
    return transactionsToSearch;
  }
  return transactionsToSearch.filter((tx) => {
    const fieldsToCheck = ['to', 'from', 'hash', 'value'];
    return fieldsToCheck.find((field) => {
      // search for amount
      if (field === 'value') {
        const val = tx.get('value');
        const txValue = val ? new TokenUnits(val.value(), 18) : null;
        if (!txValue) {
          return false;
        }
        return txValue.getDecimalized(3).toString().includes(searchValue);
      }
      // search for field
      return tx.get(field).includes(searchValue);
    });
  });
};

const getFieldForFilter = (txFilter) => {
  if (txFilter === 'IN') {
    return 'to';
  }
  if (txFilter === 'OUT') {
    return 'from';
  }
};

export const filterTransactions = (filterValue, accountId, transactionsToFilter, accounts) => {
  if (filterValue === 'ALL') {
    return transactionsToFilter;
  }
  const inOrOut = getFieldForFilter(filterValue);
  return transactionsToFilter.filter((tx) => {
    const accountAddress = tx.get(inOrOut);
    if (accountId) {
      return accountAddress === accountId;
    }
    return accounts.filter((account) => accountAddress === account.get('id')).size > 0;
  });
};
