import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import { setAddressBook } from './actions';
import { reducer } from './reducer';

describe('address book reducer', () => {
  it('should set contacts on ADDRESSBOOK/SET_BOOK', () => {
    const createTimestamp = new Date(1500000000000);

    const contacts: PersistentState.AddressbookItem[] = [
      {
        address: { type: 'plain', address: '0x1' },
        blockchain: blockchainCodeToId(BlockchainCode.Sepolia),
        createTimestamp,
      },
      {
        address: { type: 'plain', address: '0x2' },
        blockchain: blockchainCodeToId(BlockchainCode.Sepolia),
        createTimestamp,
      },
    ];

    expect(reducer(undefined, setAddressBook(BlockchainCode.Sepolia, contacts))).toEqual({
      contacts: {
        [BlockchainCode.Sepolia]: [
          {
            address: {
              type: 'plain',
              address: '0x1',
            },
            blockchain: blockchainCodeToId(BlockchainCode.Sepolia),
            createTimestamp,
          },
          {
            address: {
              type: 'plain',
              address: '0x2',
            },
            blockchain: blockchainCodeToId(BlockchainCode.Sepolia),
            createTimestamp,
          },
        ],
      },
    });
  });
});
