import { AddressBookItem, AddressBookService, IAddressBookService, IApi } from '@emeraldwallet/core';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import * as screen from '../screen';
import { contactDeletedAction, newContactAddedAction, setAddressBook } from './actions';
import { ActionTypes, AddContactAction, DeleteContactAction, ILoadContactsAction } from './types';

function* loadAddresses (service: IAddressBookService, action: ILoadContactsAction) {
  const chain = action.payload;

  const items: AddressBookItem[] = yield call(service.getItems, chain);

  yield put(setAddressBook(chain, items));
}

function* addContact (service: IAddressBookService, action: AddContactAction) {
  const { address, name, description, blockchain } = action.payload;
  const newContact = new AddressBookItem(blockchain, address, description, name);

  const result = yield call(service.addNew, newContact);

  yield put(newContactAddedAction(newContact));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

function* deleteContact (service: IAddressBookService, action: DeleteContactAction) {
  const { blockchain, address } = action.payload;

  const result = yield call(service.remove, blockchain, address);

  yield put(contactDeletedAction(blockchain, address));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

export function* root (api: IApi) {
  const service = new AddressBookService(api.vault);
  yield takeEvery(ActionTypes.LOAD, loadAddresses, service);
  yield takeEvery(ActionTypes.ADD_CONTACT, addContact, service);
  yield takeEvery(ActionTypes.DELETE_ADDRESS, deleteContact, service);
}
