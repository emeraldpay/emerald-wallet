import BigNumber from 'bignumber.js';
import { fromJS } from 'immutable';
import { filterTransactions, searchTransactions } from './selectors';

const fixture = [
  {
    to: '0x123',
    from: '0x999',
    hash: '0x000',
    value: new BigNumber(4444)
  },
  {
    to: '0x456',
    from: '0x01',
    hash: '0x02',
    value: new BigNumber(3333)
  }
];

describe('history selectors', () => {
  describe('searchTransactions', () => {
    it('handles txs with to == null or hash == null correctly', () => {
      const transactions = fromJS([
        {
          to: null,
          from: '0x999',
          hash: null,
          value: new BigNumber(4444)
        }]);
      const searchResults = searchTransactions('999', transactions);
      expect(searchResults.size).toEqual(1);
    });
    it('returns empty array if no transactions', () => {
      const transactions = fromJS([]);
      const searchResults = searchTransactions('foo', transactions);
      expect(searchResults.size).toEqual(0);
    });
    it('matches "to" field', () => {
      const transactions = fromJS(fixture);
      const searchResults = searchTransactions('123', transactions);
      expect(searchResults.size).toEqual(1);
    });
    it('matches "from" field', () => {
      const transactions = fromJS(fixture);
      const searchResults = searchTransactions('999', transactions);
      expect(searchResults.size).toEqual(1);
    });
    it('matches "hash" field', () => {
      const transactions = fromJS(fixture);
      const searchResults = searchTransactions('0x02', transactions);
      expect(searchResults.size).toEqual(1);
    });
    it('does not find "hash" field that doesnt exist', () => {
      const transactions = fromJS(fixture);
      const searchResults = searchTransactions('0x09er', transactions);
      expect(searchResults.size).toEqual(0);
    });
  });
  describe('filterTransactions', () => {
    it('returns empty array if no transactions', () => {
      const transactions = fromJS([]);
      const accounts = fromJS([]);
      const filterResults = filterTransactions('ALL', null, transactions, accounts);
      expect(filterResults.size).toEqual(0);
    });
    it('matches ALL to everything', () => {
      const transactions = fromJS(fixture);
      const accounts = fromJS([]);
      const filterResults = filterTransactions('ALL', null, transactions, accounts);
      expect(filterResults.size).toEqual(2);
    });
    it('matches IN to "to" field', () => {
      const transactions = fromJS(fixture);
      const accounts = fromJS([
        {
          id: '0x456'
        }
      ]);

      const filterResults = filterTransactions('IN', null, transactions, accounts);
      expect(filterResults.size).toEqual(1);
      expect(filterResults.get(0).get('hash')).toEqual('0x02');
    });
    it('matches OUT to "from" field', () => {
      const transactions = fromJS(fixture);
      const accounts = fromJS([
        {
          id: '0x01'
        }
      ]);
      const filterResults = filterTransactions('OUT', null, transactions, accounts);
      expect(filterResults.size).toEqual(1);
    });
  });
});
