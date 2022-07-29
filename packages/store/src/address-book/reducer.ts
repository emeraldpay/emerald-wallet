import { BlockchainCode, blockchainIdToCode, PersistentState } from '@emeraldwallet/core';
import { ActionTypes, AddressBookAction, Contacts, IAddressBookState, ISetAddressBookAction } from './types';

export const INITIAL_STATE: IAddressBookState = {
  loading: false,
  contacts: {},
};

function onLoading(state: IAddressBookState, loading: boolean): IAddressBookState {
  return {
    ...state,
    loading,
  };
}

function onSetAddressBook(state: IAddressBookState, action: ISetAddressBookAction): IAddressBookState {
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

function onNewContactAdded(state: IAddressBookState, contact: PersistentState.AddressbookItem): IAddressBookState {
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

function onContactDeleted(state: IAddressBookState, blockchain: BlockchainCode, id: string): IAddressBookState {
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

export function reducer(state: IAddressBookState = INITIAL_STATE, action: AddressBookAction): IAddressBookState {
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
