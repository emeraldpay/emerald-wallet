import {INITIAL_STATE, reducer} from "./reducer";
import {
  newContactAddedAction,
  setLoadingAction,
  setAddressBook,
  contactDeletedAction
} from "./actions";
import {BlockchainCode} from "@emeraldwallet/core";

describe('address book reducer', () => {
  it('handles Actions.LOADING', () => {
    let state = reducer(undefined, setLoadingAction(true));
    expect(state).toEqual({...INITIAL_STATE, loading: true});
    state = reducer(undefined, setLoadingAction(false));
    expect(state).toEqual({...INITIAL_STATE, loading: false});
  });

  it('should delete contact on ADDRESSBOOK/DELETE_ADDRESS', () => {
    let state = reducer(undefined, newContactAddedAction(BlockchainCode.ETC, '0x123', 'name1', 'desc1'));
    expect(state.contacts[BlockchainCode.ETC]['0x123'].name).toEqual('name1');
    expect(state.contacts[BlockchainCode.ETC]['0x123'].blockchain).toEqual(BlockchainCode.ETC);

    state = reducer(state, newContactAddedAction(BlockchainCode.ETC, '0x999', 'name2', 'desc2'));
    expect(state.contacts[BlockchainCode.ETC]['0x999'].name).toEqual('name2');

    state = reducer(state, newContactAddedAction(BlockchainCode.ETH, '0x999', 'name2', 'desc2'));
    expect(state.contacts[BlockchainCode.ETH]['0x999'].name).toEqual('name2');

    state = reducer(state, contactDeletedAction(BlockchainCode.ETC, '0x999'));
    expect(state.contacts[BlockchainCode.ETC]['0x999']).toBeUndefined();
  });

  it('should set contacts on ADDRESSBOOK/SET_BOOK', () => {
    const contacts = [
      { address: '0x1' },
      { address: '0x2' }
    ];
    const chain = BlockchainCode.Morden;
    let state = reducer(undefined, setAddressBook(chain, contacts));

    expect(state).toEqual({
      loading: false,
      contacts: {
        [BlockchainCode.Morden]: {
          '0x1': {
            address: '0x1',
            blockchain: BlockchainCode.Morden,
          },
          '0x2': {
            address: '0x2',
            blockchain: BlockchainCode.Morden,
          },
        }
      }
    })
  })
});
