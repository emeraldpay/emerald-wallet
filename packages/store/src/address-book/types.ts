import { BlockchainCode, PersistentState } from '@emeraldwallet/core';

export const moduleName = 'addressBook';

export enum ActionTypes {
  LOAD = 'ADDRESSBOOK/LOAD',
  LOAD_LEGACY = 'ADDRESSBOOK/LOAD_LEGACY',
  LOADING = 'ADDRESSBOOK/LOADING',
  LOADED = 'ADDRESSBOOK/LOADED',
  ADD_CONTACT = 'ADDRESSBOOK/ADD_ADDRESS',
  NEW_ADDRESS_ADDED = 'ADDRESSBOOK/NEW_CONTACT_ADDED',
  DELETE_ADDRESS = 'ADDRESSBOOK/DELETE_ADDRESS',
  ADDRESS_DELETED = 'ADDRESSBOOK/ADDRESS_DELETED',
  SET_BOOK = 'ADDRESSBOOK/SET_BOOK',
}

// FIXME incompatible with Bitcoin
export interface Contacts {
  [key: string]: PersistentState.AddressbookItem;
}

export interface IAddressBookState {
  loading: boolean;
  contacts: {
    [chain in BlockchainCode]?: Contacts;
  };
}

export interface AddContactAction {
  type: ActionTypes.ADD_CONTACT;
  payload: PersistentState.AddressbookItem;
}

export interface ContactAddedAction {
  type: ActionTypes.NEW_ADDRESS_ADDED;
  payload: PersistentState.AddressbookItem;
}

export interface SetLoadingAction {
  type: ActionTypes.LOADING;
  payload: boolean;
}

export interface DeleteContactAction {
  type: ActionTypes.DELETE_ADDRESS;
  payload: {
    blockchain: BlockchainCode;
    id: string;
  };
}

export interface ContactDeletedAction {
  type: ActionTypes.ADDRESS_DELETED;
  payload: {
    blockchain: BlockchainCode;
    id: string;
  };
}

export interface ILoadContactsAction {
  type: ActionTypes.LOAD;
  payload: BlockchainCode;
}

export interface ISetAddressBookAction {
  type: ActionTypes.SET_BOOK;
  payload: {
    blockchain: BlockchainCode;
    contacts: PersistentState.AddressbookItem[];
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

export type AddressBookAction =
  | AddContactAction
  | ContactAddedAction
  | SetLoadingAction
  | DeleteContactAction
  | ContactDeletedAction
  | ILoadContactsAction
  | ISetAddressBookAction
  | LoadLegacyContactsAction;
