import { AddressBookItem, BlockchainCode } from '@emeraldwallet/core';
import {
  contactDeletedAction,
  newContactAddedAction,
  setAddressBook,
  setLoadingAction
} from './actions';
import { INITIAL_STATE, reducer } from './reducer';

describe('address book reducer', () => {
  it('handles Actions.LOADING', () => {
    let state = reducer(undefined, setLoadingAction(true));
    expect(state).toEqual({ ...INITIAL_STATE, loading: true });
    state = reducer(undefined, setLoadingAction(false));
    expect(state).toEqual({ ...INITIAL_STATE, loading: false });
  });

  it('should delete contact on ADDRESSBOOK/DELETE_ADDRESS', () => {
    let state = reducer(undefined, newContactAddedAction(new AddressBookItem(BlockchainCode.ETC, '0x123', 'name1', 'desc1')));
    expect(state.contacts[BlockchainCode.ETC]!!['0x123'].name).toEqual('name1');
    expect(state.contacts[BlockchainCode.ETC]!!['0x123'].blockchain).toEqual(BlockchainCode.ETC);

    state = reducer(state, newContactAddedAction(new AddressBookItem(BlockchainCode.ETC, '0x999', 'name2', 'desc2')));
    expect(state.contacts[BlockchainCode.ETC]!!['0x999'].name).toEqual('name2');

    state = reducer(state, newContactAddedAction(new AddressBookItem(BlockchainCode.ETH, '0x999', 'name2', 'desc2')));
    expect(state.contacts[BlockchainCode.ETH]!!['0x999'].name).toEqual('name2');

    state = reducer(state, contactDeletedAction(BlockchainCode.ETC, '0x999'));
    expect(state.contacts[BlockchainCode.ETC]).toBeUndefined();
  });

  it('should set contacts on ADDRESSBOOK/SET_BOOK', () => {
    const contacts = [
      { address: '0x1', blockchain: BlockchainCode.Kovan },
      { address: '0x2', blockchain: BlockchainCode.Kovan }
    ];
    const chain = BlockchainCode.Kovan;
    const state = reducer(undefined, setAddressBook(chain, contacts));

    expect(state).toEqual({
      loading: false,
      contacts: {
        [BlockchainCode.Kovan]: {
          '0x1': {
            address: '0x1',
            blockchain: BlockchainCode.Kovan
          },
          '0x2': {
            address: '0x2',
            blockchain: BlockchainCode.Kovan
          }
        }
      }
    });
  });
});
