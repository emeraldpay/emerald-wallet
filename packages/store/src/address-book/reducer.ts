import { BlockchainCode } from '@emeraldwallet/core';
import {ActionTypes, AddressBookAction, Contacts, IAddressBookState, Contact} from './types';

export const INITIAL_STATE: IAddressBookState = {
  loading: false,
  contacts: {}
};

function onLoading (state: IAddressBookState, loading: boolean): IAddressBookState {
  return {
    ...state,
    loading
  };
}

function onSetAddressBook (state: IAddressBookState, action: any): IAddressBookState {
  const { blockchain, contacts } = action;
  const newContacts: {
    [chain in BlockchainCode]?: any
  } = {};
  contacts.forEach((v: any) => {
    newContacts[v.address as BlockchainCode] = { ...v, blockchain };
  });
  return {
    ...state,
    contacts: {
      ...state.contacts,
      [blockchain as BlockchainCode]: newContacts
    }
  };
}

function onNewContactAdded (state: IAddressBookState, contact: Contact): IAddressBookState {
  const chain = contact.blockchain as BlockchainCode;
  const contacts = {
    ...state.contacts[chain],
    [contact.address]: contact
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

function onContactDeleted (state: IAddressBookState, contact: Contact): IAddressBookState {
  let contacts: Contacts | undefined = state.contacts[contact.blockchain as BlockchainCode];
  if (typeof contacts !== 'undefined') {
    let copy: Contacts = {};
    Object.keys(contacts)
      .filter((address) => address !== contact.address)
      .forEach((address) => {
        copy[address] = contacts![address]
      });
    return Object.assign({}, state, {contacts: copy});
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
      return onContactDeleted(state, action.payload);
    case ActionTypes.SET_BOOK:
      return onSetAddressBook(state, action.payload);
    default:
      return state;
  }
}
