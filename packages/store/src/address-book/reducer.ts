import { ActionTypes, AddressBookAction, AddressBookState, SetAddressBookAction } from './types';

export const INITIAL_STATE: AddressBookState = {
  contacts: {},
};

function onSetAddressBook(state: AddressBookState, action: SetAddressBookAction): AddressBookState {
  const { blockchain, contacts } = action.payload;

  return {
    ...state,
    contacts: {
      ...state.contacts,
      [blockchain]: contacts,
    },
  };
}

export function reducer(state: AddressBookState = INITIAL_STATE, action: AddressBookAction): AddressBookState {
  switch (action.type) {
    case ActionTypes.SET_ADDRESS_BOOK:
      return onSetAddressBook(state, action);
    default:
      return state;
  }
}
