import BigNumber from 'bignumber.js';
import {filterTransactions, searchTransactions} from './selectors';
import {BlockchainCode, IStoredTransaction} from "@emeraldwallet/core";
import {WalletEntry} from '@emeraldpay/emerald-vault-core';

const fixture: IStoredTransaction[] = [
  {
    to: '0x123',
    from: '0x999',
    hash: '0x000',
    value: new BigNumber(4444),
    nonce: 1,
    gas: 1000,
    gasPrice: "100",
    blockchain: BlockchainCode.ETH
  },
  {
    to: '0x456',
    from: '0x01',
    hash: '0x02',
    value: new BigNumber(3333),
    nonce: 1,
    gas: 1000,
    gasPrice: "100",
    blockchain: BlockchainCode.ETH
  }
];

describe('history selectors', () => {
  describe('searchTransactions', () => {
    it('handles txs with to == null or hash == null correctly', () => {
      const transactions: IStoredTransaction[] = [
        {
          to: '0x999',
          from: '0x999',
          hash: '0x999',
          value: new BigNumber(4444),
          nonce: 1,
          gas: 1000,
          gasPrice: "100",
          blockchain: BlockchainCode.ETH
        }];
      const searchResults = searchTransactions('999', transactions);
      expect(searchResults.length).toEqual(1);
    });
    it('returns empty array if no transactions', () => {
      const searchResults = searchTransactions('foo', []);
      expect(searchResults.length).toEqual(0);
    });
    it('matches "to" field', () => {
      const searchResults = searchTransactions('123', fixture);
      expect(searchResults.length).toEqual(1);
    });
    it('matches "from" field', () => {
      const searchResults = searchTransactions('999', fixture);
      expect(searchResults.length).toEqual(1);
    });
    it('matches "hash" field', () => {
      const searchResults = searchTransactions('0x02', fixture);
      expect(searchResults.length).toEqual(1);
    });
    it('does not find "hash" field that doesnt exist', () => {
      const searchResults = searchTransactions('0x09er', fixture);
      expect(searchResults.length).toEqual(0);
    });
  });
  describe('filterTransactions', () => {
    it('returns empty array if no transactions', () => {
      const filterResults = filterTransactions('ALL', null, [], []);
      expect(filterResults.length).toEqual(0);
    });
    it('matches ALL to everything', () => {
      const filterResults = filterTransactions('ALL', null, fixture, []);
      expect(filterResults.length).toEqual(2);
    });
    it('matches IN to "to" field', () => {
      const accounts: WalletEntry[] = [
        {
          address: {type: "single", value: '0x456'}
        } as WalletEntry
      ];

      const filterResults = filterTransactions('IN', null, fixture, accounts);
      expect(filterResults.length).toEqual(1);
      expect(filterResults[0].hash).toEqual('0x02');
    });
    it('matches OUT to "from" field', () => {
      const accounts = [
        {
          address: {type: "single", value: '0x01'}
        } as WalletEntry
      ];
      const filterResults = filterTransactions('OUT', null, fixture, accounts);
      expect(filterResults.length).toEqual(1);
    });
  });
});
