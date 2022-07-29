import { BlockchainCode, blockchainCodeToId, PersistentState } from '@emeraldwallet/core';
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
      id: '90539b1b-78ff-4c2f-aa9b-1cb25c810ef6',
      blockchain: blockchainCodeToId(BlockchainCode.ETC),
      address: {type: 'plain', address: '0x123'},
      label: 'name1',
      description: 'desc1',
      createTimestamp: new Date()
    }));

    expect(state.contacts[BlockchainCode.ETC]!!['0x123'].label).toEqual('name1');
    expect(state.contacts[BlockchainCode.ETC]!!['0x123'].blockchain).toEqual(101);

    state = reducer(state, newContactAddedAction({
      id: 'f789c9c0-4fda-4226-871c-200ebc7abd03',
      blockchain: blockchainCodeToId(BlockchainCode.ETC),
      address: {type: 'plain', address: '0x999'},
      label: 'name2',
      description: 'desc2',
      createTimestamp: new Date()
    }));
    expect(state.contacts[BlockchainCode.ETC]!!['0x999'].label).toEqual('name2');

    state = reducer(state, newContactAddedAction({
      id: '66ccdbe6-9948-42b4-b00c-553bd004cdaf',
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {type: 'plain', address: '0x999'},
      label: 'name2',
      description: 'desc2',
      createTimestamp: new Date()
    }));
    expect(state.contacts[BlockchainCode.ETH]).toBeDefined();
    expect(state.contacts[BlockchainCode.ETH]!!['0x999'].label).toEqual('name2');

    state = reducer(state, contactDeletedAction(BlockchainCode.ETH, '66ccdbe6-9948-42b4-b00c-553bd004cdaf'));
    expect(state.contacts[BlockchainCode.ETH]).toBeUndefined();
  });

  it('should set contacts on ADDRESSBOOK/SET_BOOK', () => {
    const createTimestamp = new Date(1500000000000);
    const contacts: PersistentState.AddressbookItem[] = [
      {address: {type: 'plain', address: '0x1'}, blockchain: blockchainCodeToId(BlockchainCode.Kovan), createTimestamp},
      {address: {type: 'plain', address: '0x2'}, blockchain: blockchainCodeToId(BlockchainCode.Kovan), createTimestamp}
    ];
    const chain = BlockchainCode.Kovan;
    const state = reducer(undefined, setAddressBook(chain, contacts));

    expect(state).toEqual({
      loading: false,
      contacts: {
        [BlockchainCode.Kovan]: {
          '0x1': {
            address: {
              type: "plain",
              address: '0x1'
            },
            blockchain: 10002,
            createTimestamp
          },
          '0x2': {
            address: {
              type: "plain",
              address: '0x2'
            },
            blockchain: 10002,
            createTimestamp
          }
        }
      }
    });
  });
});
