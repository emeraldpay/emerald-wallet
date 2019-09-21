import { IApi } from '@emeraldwallet/core';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { gotoScreen } from '../screen/actions';
import { contactDeletedAction, newContactAddedAction, setAddressBook } from './actions';
import { ActionTypes, AddContactAction, DeleteContactAction, LoadContactsAction } from './types';

function* loadAddresses (api: IApi, action: LoadContactsAction) {
  const chain = action.payload;
  const contacts = yield call(api.emerald.listAddresses, chain);
  yield put(setAddressBook(chain, contacts));
}

function* addContact (api: IApi, action: AddContactAction) {
  const { address, name, description, blockchain } = action.payload;
  const result = yield call(api.emerald.importAddress, { address, name, description }, blockchain);
  yield put(newContactAddedAction(blockchain, address, name, description));
  yield put(gotoScreen('address-book'));
}

function* deleteContact (api: IApi, action: DeleteContactAction) {
  const { blockchain, address } = action.payload;
  const result = yield call(api.emerald.deleteAddress, address, blockchain);
  yield put(contactDeletedAction(blockchain, address));
  yield put(gotoScreen('address-book'));
}

export function* root (api: IApi) {
  yield takeEvery(ActionTypes.LOAD, loadAddresses, api);
  yield takeEvery(ActionTypes.ADD_CONTACT, addContact, api);
  yield takeEvery(ActionTypes.DELETE_ADDRESS, deleteContact, api);
}
