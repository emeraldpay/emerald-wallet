import {BlockchainCode, blockchainCodeToId} from '@emeraldwallet/core';
import {
  ActionTypes,
  AddContactAction,
  ContactAddedAction, ContactDeletedAction,
  DeleteContactAction,
  ILoadContactsAction,
  ISetAddressBookAction,
  SetLoadingAction
} from './types';
import {AddressBookItem} from '@emeraldpay/emerald-vault-core';

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
      address: {type: "single", value: address},
      name,
      description,
      blockchain: blockchainCodeToId(chain),
      createdAt: new Date()
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

export function loadAddressBook(chain: BlockchainCode): ILoadContactsAction {
  return {
    type: ActionTypes.LOAD,
    payload: chain
  };
}

export function setAddressBook (chain: BlockchainCode, addressBook: AddressBookItem[]): ISetAddressBookAction {
  return {
    type: ActionTypes.SET_BOOK,
    payload: {
      blockchain: chain,
      contacts: addressBook
    }
  };
}
