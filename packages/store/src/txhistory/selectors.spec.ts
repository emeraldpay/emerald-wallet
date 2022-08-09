import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { PersistentState } from '@emeraldwallet/core';
import { filterTransactions, searchTransactions } from './selectors';
import { StoredTransaction } from './types';

const { ChangeType, Direction, State, Status } = PersistentState;

const blockchain = blockchainCodeToId(BlockchainCode.ETH);

const entries: WalletEntry[] = [
  {
    blockchain,
    address: {
      type: 'single',
      value: '0x999',
    },
    addresses: [],
    createdAt: new Date(),
    id: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    key: {
      type: 'hd-path',
      hdPath: '',
      keyId: '',
      seedId: '',
    },
    xpub: [],
  },
];

const transactions = [
  new StoredTransaction({
    blockchain,
    changes: [
      {
        address: '0x999',
        amount: '-100001',
        asset: 'ETH',
        direction: Direction.SPEND,
        type: ChangeType.TRANSFER,
        wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      },
    ],
    sinceTimestamp: new Date('2021-01-05T10:11:12'),
    state: State.PREPARED,
    status: Status.UNKNOWN,
    txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
  }),
];

describe('history selectors', () => {
  describe('searchTransactions', () => {
    describe('filterTransactions', () => {
      it('returns empty array if no transactions', () => {
        const filterResults = filterTransactions([], [], 'ALL');

        expect(filterResults.length).toEqual(0);
      });

      it('matches ALL to everything', () => {
        const filterResults = filterTransactions(entries, transactions, 'ALL');

        expect(filterResults.length).toEqual(1);
      });
    });

    it('returns empty array if no transactions', () => {
      const searchResults = searchTransactions(transactions, 'foo');

      expect(searchResults.length).toEqual(0);
    });

    it('matches "hash" field', () => {
      const searchResults = searchTransactions(transactions, '0x5e');

      expect(searchResults.length).toEqual(1);
    });

    it('does not find "hash" field that doesnt exist', () => {
      const searchResults = searchTransactions(transactions, '0x09');

      expect(searchResults.length).toEqual(0);
    });
  });
});
