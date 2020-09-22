import {BlockchainCode, blockchainIdToCode} from '@emeraldwallet/core';
import {ActionTypes, AddressBookAction, Contacts, IAddressBookState, ISetAddressBookAction} from './types';
import {AddressBookItem} from '@emeraldpay/emerald-vault-core';

export const INITIAL_STATE: IAddressBookState = {
  loading: false,
  contacts: {}
};

function onLoading(state: IAddressBookState, loading: boolean): IAddressBookState {
  return {
    ...state,
    loading
  };
}

function onSetAddressBook(state: IAddressBookState, action: ISetAddressBookAction): IAddressBookState {
  const {blockchain, contacts} = action.payload;
  const newContacts: Contacts = {};
  contacts.forEach((v) => {
    newContacts[v.address.value] = v;
  });
  return {
    ...state,
    contacts: {
      ...state.contacts,
      [blockchain]: newContacts
    }
  };
}

function onNewContactAdded (state: IAddressBookState, contact: AddressBookItem): IAddressBookState {
  const chain = blockchainIdToCode(contact.blockchain);
  if (contact.address.type != "single") {
    console.warn("Unsupported address in the bookmark", contact)
    return state;
  }
  const contacts = {
    ...state.contacts[chain],
    [contact.address.value]: contact
  };

  return {
    ...state,
    contacts: {
      ...state.contacts,
      [chain]: {
        ...contacts
      }
    }
  };
}

function onContactDeleted(state: IAddressBookState,
                          blockchain: BlockchainCode,
                          address: string): IAddressBookState {
  const contacts: Contacts | undefined = state.contacts[blockchain];
  if (typeof contacts !== 'undefined') {
    const copy: Contacts = {};
    Object.keys(contacts)
      .filter((address) => address !== address)
      .forEach((address) => {
        copy[address] = contacts![address];
      });
    return {...state, contacts: copy};
  }
  return state;
}

export function reducer (
  state: IAddressBookState = INITIAL_STATE,
  action: AddressBookAction
): IAddressBookState {
  switch (action.type) {
    case ActionTypes.LOADING:
      return onLoading(state, action.payload);
    case ActionTypes.NEW_ADDRESS_ADDED:
      return onNewContactAdded(state, action.payload);
    case ActionTypes.ADDRESS_DELETED:
      return onContactDeleted(state, action.payload.blockchain, action.payload.address);
    case ActionTypes.SET_BOOK:
      return onSetAddressBook(state, action);
    default:
      return state;
  }
}
