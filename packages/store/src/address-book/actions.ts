import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import {
  ActionTypes,
  AddContactAction,
  DeleteContactAction,
  EditContactAction,
  LoadContactsAction,
  LoadLegacyContactsAction,
  SetAddressBookAction,
} from './types';
import { Dispatched } from '../types';

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
    type: ActionTypes.SET_ADDRESS_BOOK,
    payload: {
      blockchain: chain,
      contacts: addressBook,
    },
  };
}

export function addContactAction(address: string, blockchain: BlockchainCode, label?: string): AddContactAction {
  return {
    type: ActionTypes.ADD_CONTACT,
    payload: {
      label,
      address: { type: 'plain', address },
      blockchain: blockchainCodeToId(blockchain),
    },
  };
}

export function editContactAction(blockchain: BlockchainCode, id?: string, label?: string): EditContactAction {
  return {
    type: ActionTypes.EDIT_CONTACT,
    payload: {
      id,
      label,
      blockchain: blockchainCodeToId(blockchain),
    },
  };
}

export function deleteContactAction(blockchain: BlockchainCode, id: string): DeleteContactAction {
  return {
    type: ActionTypes.DELETE_CONTACT,
    payload: { blockchain, id },
  };
}

export function getAddressBookItem(id: string): Dispatched<PersistentState.AddressbookItem> {
  return (dispatch, getState, extra) => extra.api.addressBook.get(id);
}
