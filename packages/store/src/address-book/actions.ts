import { BlockchainCode, blockchainCodeToId, PersistentState } from '@emeraldwallet/core';
import {
  ActionTypes,
  AddContactAction,
  ContactAddedAction,
  ContactDeletedAction,
  DeleteContactAction,
  ILoadContactsAction,
  ISetAddressBookAction,
  LoadLegacyContactsAction,
  SetLoadingAction,
} from './types';

export function setLoadingAction(loading: boolean): SetLoadingAction {
  return {
    type: ActionTypes.LOADING,
    payload: loading,
  };
}

export function addContactAction(
  chain: BlockchainCode,
  address: string,
  label: string,
  description: string,
): AddContactAction {
  return {
    type: ActionTypes.ADD_CONTACT,
    payload: {
      description,
      label,
      address: { type: 'plain', address },
      blockchain: blockchainCodeToId(chain),
      createTimestamp: new Date(),
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

export function loadAddressBook(chain: BlockchainCode): ILoadContactsAction {
  return {
    type: ActionTypes.LOAD,
    payload: chain,
  };
}

export function setAddressBook(
  chain: BlockchainCode,
  addressBook: PersistentState.AddressbookItem[],
): ISetAddressBookAction {
  return {
    type: ActionTypes.SET_BOOK,
    payload: {
      blockchain: chain,
      contacts: addressBook,
    },
  };
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
