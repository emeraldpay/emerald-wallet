import {BlockchainCode, blockchainCodeToId} from '@emeraldwallet/core';
import {
  contactDeletedAction,
  newContactAddedAction,
  setAddressBook,
  setLoadingAction
} from './actions';
import {INITIAL_STATE, reducer} from './reducer';
import {AddressBookItem} from '@emeraldpay/emerald-vault-core';

describe('address book reducer', () => {
  it('handles Actions.LOADING', () => {
    let state = reducer(undefined, setLoadingAction(true));
    expect(state).toEqual({...INITIAL_STATE, loading: true});
    state = reducer(undefined, setLoadingAction(false));
    expect(state).toEqual({...INITIAL_STATE, loading: false});
  });

  it('should delete contact on ADDRESSBOOK/DELETE_ADDRESS', () => {
    let state = reducer(undefined, newContactAddedAction({
      blockchain: blockchainCodeToId(BlockchainCode.ETC),
      address: {type: 'single', value: '0x123'},
      name: 'name1',
      description: 'desc1',
      createdAt: new Date()
    }));

    expect(state.contacts[BlockchainCode.ETC]!!['0x123'].name).toEqual('name1');
    expect(state.contacts[BlockchainCode.ETC]!!['0x123'].blockchain).toEqual(101);

    state = reducer(state, newContactAddedAction({
      blockchain: blockchainCodeToId(BlockchainCode.ETC),
      address: {type: 'single', value: '0x999'},
      name: 'name2',
      description: 'desc2',
      createdAt: new Date()
    }));
    expect(state.contacts[BlockchainCode.ETC]!!['0x999'].name).toEqual('name2');

    state = reducer(state, newContactAddedAction({
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {type: 'single', value: '0x999'},
      name: 'name2',
      description: 'desc2',
      createdAt: new Date()
    }));
    expect(state.contacts[BlockchainCode.ETH]).toBeDefined();
    expect(state.contacts[BlockchainCode.ETH]!!['0x999'].name).toEqual('name2');

    state = reducer(state, contactDeletedAction(BlockchainCode.ETC, '0x999'));
    expect(state.contacts[BlockchainCode.ETC]).toBeUndefined();
  });

  it('should set contacts on ADDRESSBOOK/SET_BOOK', () => {
    const createdAt = new Date(1500000000000);
    const contacts: AddressBookItem[] = [
      {address: {type: 'single', value: '0x1'}, blockchain: blockchainCodeToId(BlockchainCode.Kovan), createdAt},
      {address: {type: 'single', value: '0x2'}, blockchain: blockchainCodeToId(BlockchainCode.Kovan), createdAt}
    ];
    const chain = BlockchainCode.Kovan;
    const state = reducer(undefined, setAddressBook(chain, contacts));

    expect(state).toEqual({
      loading: false,
      contacts: {
        [BlockchainCode.Kovan]: {
          '0x1': {
            address: {
              type: "single",
              value: '0x1'
            },
            blockchain: 10002,
            createdAt
          },
          '0x2': {
            address: {
              type: "single",
              value: '0x2'
            },
            blockchain: 10002,
            createdAt
          }
        }
      }
    });
  });
});
