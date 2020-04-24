import { AddressBookItem, BlockchainCode } from '@emeraldwallet/core';

export const moduleName = 'addressBook';

export enum ActionTypes {
  LOAD = 'ADDRESSBOOK/LOAD',
  LOADING = 'ADDRESSBOOK/LOADING',
  LOADED = 'ADDRESSBOOK/LOADED',
  ADD_CONTACT = 'ADDRESSBOOK/ADD_ADDRESS',
  NEW_ADDRESS_ADDED = 'ADDRESSBOOK/NEW_CONTACT_ADDED',
  DELETE_ADDRESS = 'ADDRESSBOOK/DELETE_ADDRESS',
  ADDRESS_DELETED = 'ADDRESSBOOK/ADDRESS_DELETED',
  SET_BOOK = 'ADDRESSBOOK/SET_BOOK'
}

// FIXME incompatible with Bitcoin
export interface Contacts {[key: string]: AddressBookItem;}

export interface IAddressBookState {
  loading: boolean;
  contacts: {
    [chain in BlockchainCode]?: Contacts;
  };
}

export interface AddContactAction {
  type: ActionTypes.ADD_CONTACT;
  payload: AddressBookItem;
}

export interface ContactAddedAction {
  type: ActionTypes.NEW_ADDRESS_ADDED;
  payload: AddressBookItem;
}

export interface SetLoadingAction {
  type: ActionTypes.LOADING;
  payload: boolean;
}

export interface DeleteContactAction {
  type: ActionTypes.DELETE_ADDRESS;
  payload: {
    blockchain: BlockchainCode;
    address: string;
  };
}

export interface ContactDeletedAction {
  type: ActionTypes.ADDRESS_DELETED;
  payload: {
    blockchain: BlockchainCode;
    address: string;
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
    contacts: AddressBookItem[];
  };
}

export type AddressBookAction =
  | AddContactAction
  | ContactAddedAction
  | SetLoadingAction
  | DeleteContactAction
  | ContactDeletedAction
  | ILoadContactsAction
  | ISetAddressBookAction;
