import { BlockchainCode, PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { ActionTypes, AddressBookAction, AddressBookState, Contacts, SetAddressBookAction } from './types';

export const INITIAL_STATE: AddressBookState = {
  loading: false,
  contacts: {},
};

function onLoading(state: AddressBookState, loading: boolean): AddressBookState {
  return {
    ...state,
    loading,
  };
}

function onSetAddressBook(state: AddressBookState, action: SetAddressBookAction): AddressBookState {
  const { blockchain, contacts } = action.payload;

  return {
    ...state,
    contacts: {
      ...state.contacts,
      [blockchain]: contacts.reduce(
        (carry, contact) => ({
          ...carry,
          [contact.address.address]: contact,
        }),
        {},
      ),
    },
  };
}

function onNewContactAdded(state: AddressBookState, contact: PersistentState.AddressbookItem): AddressBookState {
  const chain = blockchainIdToCode(contact.blockchain);

  if (contact.address.type != 'plain') {
    console.warn('Unsupported address in the bookmark', contact);

    return state;
  }

  const contacts = {
    ...state.contacts[chain],
    [contact.address.address]: contact,
  };

  return {
    ...state,
    contacts: {
      ...state.contacts,
      [chain]: contacts,
    },
  };
}

function onContactDeleted(state: AddressBookState, blockchain: BlockchainCode, id: string): AddressBookState {
  const contacts: Contacts | undefined = state.contacts[blockchain];

  if (contacts != null) {
    return {
      ...state,
      contacts: {
        ...state.contacts,
        [blockchain]: Object.values(contacts)
          .filter((contact) => contact.id !== id)
          .reduce<Contacts | undefined>(
            (carry, contact) => ({
              ...(carry ?? {}),
              [contact.address.address]: contact,
            }),
            undefined,
          ),
      },
    };
  }

  return state;
}

export function reducer(state: AddressBookState = INITIAL_STATE, action: AddressBookAction): AddressBookState {
  switch (action.type) {
    case ActionTypes.LOADING:
      return onLoading(state, action.payload);
    case ActionTypes.NEW_ADDRESS_ADDED:
      return onNewContactAdded(state, action.payload);
    case ActionTypes.ADDRESS_DELETED:
      return onContactDeleted(state, action.payload.blockchain, action.payload.id);
    case ActionTypes.SET_BOOK:
      return onSetAddressBook(state, action);
    default:
      return state;
  }
}
