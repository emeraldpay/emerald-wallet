import {IBackendApi} from '@emeraldwallet/core';
import {all, call, put, takeEvery} from 'redux-saga/effects';
import * as screen from '../screen';
import {contactDeletedAction, newContactAddedAction, setAddressBook} from './actions';
import {ActionTypes, AddContactAction, DeleteContactAction, ILoadContactsAction} from './types';
import {AddressBookItem} from '@emeraldpay/emerald-vault-core';

function* loadAddresses(backendApi: IBackendApi, action: ILoadContactsAction) {
  const chain = action.payload;
  const items: AddressBookItem[] = yield call(backendApi.getAddressBookItems, chain);
  yield put(setAddressBook(chain, items));
}

function* addContact(backend: IBackendApi, action: AddContactAction) {
  const {address, name, description, blockchain} = action.payload;
  const newContact: AddressBookItem = {
    createdAt: new Date(),
    blockchain, address, description, name
  };

  const result = yield call(backend.addAddressBookItem, newContact);

  yield put(newContactAddedAction(newContact));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

function* deleteContact (backend: IBackendApi, action: DeleteContactAction) {
  const { blockchain, address } = action.payload;

  const result = yield call(backend.removeAddressBookItem, blockchain, address);
  // TODO: check result
  yield put(contactDeletedAction(blockchain, address));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

export function* root (backend: IBackendApi) {
  yield takeEvery(ActionTypes.LOAD, loadAddresses, backend);
  yield takeEvery(ActionTypes.ADD_CONTACT, addContact, backend);
  yield takeEvery(ActionTypes.DELETE_ADDRESS, deleteContact, backend);
}
