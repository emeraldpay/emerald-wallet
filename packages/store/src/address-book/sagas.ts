import {IApi, blockchainCodeToId, blockchainById} from '@emeraldwallet/core';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { gotoScreen } from '../screen/actions';
import { contactDeletedAction, newContactAddedAction, setAddressBook } from './actions';
import {ActionTypes, AddContactAction, Contact, DeleteContactAction, LoadContactsAction} from './types';
import { AddressBookItem } from '@emeraldpay/emerald-vault-core';

function* loadAddresses (api: IApi, action: LoadContactsAction) {
  const chain = action.payload;
  const items: AddressBookItem[] = yield call(api.vault.listAddressBook, blockchainCodeToId(chain));
  const contacts: Contact[] = items.map((item) => {
    return {
      address: item.address,
      blockchain: blockchainById(item.blockchain)!.params.code,
      name: item.name
    }
  });
  yield put(setAddressBook(chain, contacts));
}

function* addContact (api: IApi, action: AddContactAction) {
  const { address, name, description, blockchain } = action.payload;
  const add = { address, name, description, blockchain: blockchainCodeToId(blockchain) };
  const result = yield call(api.vault.addToAddressBook, add);
  yield put(newContactAddedAction(blockchain, address, name || "", description || ""));
  yield put(gotoScreen('address-book'));
}

function* deleteContact (api: IApi, action: DeleteContactAction) {
  const { blockchain, address } = action.payload;
  const result = yield call(api.vault.removeFromAddressBook, blockchainCodeToId(blockchain), address);
  yield put(contactDeletedAction(blockchain, address));
  yield put(gotoScreen('address-book'));
}

export function* root (api: IApi) {
  yield takeEvery(ActionTypes.LOAD, loadAddresses, api);
  yield takeEvery(ActionTypes.ADD_CONTACT, addContact, api);
  yield takeEvery(ActionTypes.DELETE_ADDRESS, deleteContact, api);
}
