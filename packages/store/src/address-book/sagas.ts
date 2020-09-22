import {blockchainCodeToId, IBackendApi} from '@emeraldwallet/core';
import {all, call, put, takeEvery} from 'redux-saga/effects';
import * as screen from '../screen';
import {contactDeletedAction, newContactAddedAction, setAddressBook} from './actions';
import {ActionTypes, AddContactAction, DeleteContactAction, ILoadContactsAction} from './types';
import {AddressBookItem} from '@emeraldpay/emerald-vault-core';
import {IEmeraldVault} from "@emeraldpay/emerald-vault-core/lib/vault";

function* loadAddresses(vault: IEmeraldVault, action: ILoadContactsAction) {
  const chain = action.payload;
  const items: AddressBookItem[] = yield call(vault.listAddressBook, blockchainCodeToId(chain));
  yield put(setAddressBook(chain, items));
}

function* addContact(vault: IEmeraldVault, action: AddContactAction) {
  const {address, name, description, blockchain} = action.payload;
  const newContact: AddressBookItem = {
    createdAt: new Date(),
    blockchain, address, description, name
  };

  const result = yield call(vault.addToAddressBook, newContact);

  yield put(newContactAddedAction(newContact));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

function* deleteContact(vault: IEmeraldVault, action: DeleteContactAction) {
  const {blockchain, address} = action.payload;

  const result = yield call(vault.removeFromAddressBook, blockchainCodeToId(blockchain), address);
  // TODO: check result
  yield put(contactDeletedAction(blockchain, address));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

export function* root(vault: IEmeraldVault) {
  yield takeEvery(ActionTypes.LOAD, loadAddresses, vault);
  yield takeEvery(ActionTypes.ADD_CONTACT, addContact, vault);
  yield takeEvery(ActionTypes.DELETE_ADDRESS, deleteContact, vault);
}
