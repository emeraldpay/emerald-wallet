import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import {
  ActionTypes,
  AddContactAction,
  ContactAddedAction,
  ContactDeletedAction,
  DeleteContactAction,
  EditContactAction,
  LoadContactsAction,
  LoadLegacyContactsAction,
  SetAddressBookAction,
  SetLoadingAction,
} from './types';
import { Dispatched } from '../types';

export function setLoadingAction(loading: boolean): SetLoadingAction {
  return {
    type: ActionTypes.LOADING,
    payload: loading,
  };
}

export function addContactAction(
  address: string,
  blockchain: BlockchainCode,
  label?: string,
  description?: string,
): AddContactAction {
  return {
    type: ActionTypes.ADD_CONTACT,
    payload: {
      description,
      label,
      address: { type: 'plain', address },
      blockchain: blockchainCodeToId(blockchain),
    },
  };
}

export function editContactAction(
  blockchain: BlockchainCode,
  id?: string,
  label?: string,
  description?: string,
): EditContactAction {
  return {
    type: ActionTypes.EDIT_CONTACT,
    payload: {
      description,
      id,
      label,
      blockchain: blockchainCodeToId(blockchain),
    },
  };
}

export function newContactAddedAction(contact: PersistentState.AddressbookItem): ContactAddedAction {
  return {
    type: ActionTypes.NEW_ADDRESS_ADDED,
    payload: contact,
  };
}

export function deleteContactAction(blockchain: BlockchainCode, id: string): DeleteContactAction {
  return {
    type: ActionTypes.DELETE_ADDRESS,
    payload: { blockchain, id },
  };
}

export function contactDeletedAction(blockchain: BlockchainCode, id: string): ContactDeletedAction {
  return {
    type: ActionTypes.ADDRESS_DELETED,
    payload: { id, blockchain },
  };
}

export function loadAddressBook(chain: BlockchainCode): LoadContactsAction {
  return {
    type: ActionTypes.LOAD,
    payload: chain,
  };
}

export function setAddressBook(
  chain: BlockchainCode,
  addressBook: PersistentState.AddressbookItem[],
): SetAddressBookAction {
  return {
    type: ActionTypes.SET_BOOK,
    payload: {
      blockchain: chain,
      contacts: addressBook,
    },
  };
}

export function getAddressBookItem(id: string): Dispatched<PersistentState.AddressbookItem> {
  return (dispatch, getState, extra) => extra.api.addressBook.get(id);
}

/**
 * FIXME Remove in future release
 * @deprecated
 */
export function loadLegacyAddressBook(blockchain: BlockchainCode): LoadLegacyContactsAction {
  return {
    type: ActionTypes.LOAD_LEGACY,
    payload: blockchain,
  };
}
