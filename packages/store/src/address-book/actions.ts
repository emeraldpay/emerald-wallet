import { AddressBookItem, BlockchainCode } from '@emeraldwallet/core';
import {
  ActionTypes,
  AddContactAction,
  ContactAddedAction, ContactDeletedAction,
  DeleteContactAction,
  ILoadContactsAction,
  SetAddressBookAction,
  SetLoadingAction
} from './types';

export function setLoadingAction (loading: boolean): SetLoadingAction {
  return {
    type: ActionTypes.LOADING,
    payload: loading
  };
}

export function addContactAction (
  chain: BlockchainCode, address: string, name: string, description: string): AddContactAction {
  return {
    type: ActionTypes.ADD_CONTACT,
    payload: {
      address,
      name,
      description,
      blockchain: chain
    }
  };
}

export function newContactAddedAction (contact: AddressBookItem): ContactAddedAction {
  return {
    type: ActionTypes.NEW_ADDRESS_ADDED,
    payload: contact
  };
}

export function deleteContactAction (chain: BlockchainCode, address: string): DeleteContactAction {
  return {
    type: ActionTypes.DELETE_ADDRESS,
    payload: {
      address,
      blockchain: chain
    }
  };
}

export function contactDeletedAction (chain: BlockchainCode, address: string): ContactDeletedAction {
  return {
    type: ActionTypes.ADDRESS_DELETED,
    payload: {
      address,
      blockchain: chain
    }
  };
}

export function loadAddressBook (chain: any): ILoadContactsAction {
  return {
    type: ActionTypes.LOAD,
    payload: chain
  };
}

export function setAddressBook (chain: BlockchainCode, addressBook: AddressBookItem[]): SetAddressBookAction {
  return {
    type: ActionTypes.SET_BOOK,
    payload: {
      blockchain: chain,
      contacts: addressBook
    }
  };
}
