import { BlockchainCode, PersistentState } from '@emeraldwallet/core';

export const moduleName = 'addressBook';

export enum ActionTypes {
  ADD_CONTACT = 'ADDRESS_BOOK/ADD_CONTACT',
  DELETE_CONTACT = 'ADDRESS_BOOK/DELETE_ADDRESS',
  EDIT_CONTACT = 'ADDRESS_BOOK/EDIT_CONTACT',
  LOAD = 'ADDRESS_BOOK/LOAD',
  LOAD_LEGACY = 'ADDRESS_BOOK/LOAD_LEGACY',
  SET_ADDRESS_BOOK = 'ADDRESS_BOOK/SET_BOOK',
}

export interface AddressBookState {
  contacts: {
    [chain in BlockchainCode]?: PersistentState.AddressbookItem[];
  };
}

/**
 * FIXME Remove in future release
 * @deprecated
 */
export interface LoadLegacyContactsAction {
  type: ActionTypes.LOAD_LEGACY;
  payload: BlockchainCode;
}

export interface LoadContactsAction {
  type: ActionTypes.LOAD;
  payload: BlockchainCode;
}

export interface SetAddressBookAction {
  type: ActionTypes.SET_ADDRESS_BOOK;
  payload: {
    blockchain: BlockchainCode;
    contacts: PersistentState.AddressbookItem[];
  };
}

export interface AddContactAction {
  type: ActionTypes.ADD_CONTACT;
  payload: PersistentState.AddressbookItem;
}

export interface EditContactAction {
  type: ActionTypes.EDIT_CONTACT;
  payload: Partial<Omit<PersistentState.AddressbookItem, 'blockchain'>> & { blockchain: number };
}

export interface DeleteContactAction {
  type: ActionTypes.DELETE_CONTACT;
  payload: {
    blockchain: BlockchainCode;
    id: string;
  };
}

export type AddressBookAction =
  | LoadLegacyContactsAction
  | LoadContactsAction
  | AddContactAction
  | EditContactAction
  | DeleteContactAction
  | SetAddressBookAction;
