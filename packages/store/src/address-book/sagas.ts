import { AddressBookItem, IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { PersistentState, blockchainCodeToId, blockchainIdToCode } from '@emeraldwallet/core';
import { SagaIterator } from 'redux-saga';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import * as screen from '../screen';
import { loadAddressBook, setAddressBook } from './actions';
import {
  ActionTypes,
  AddContactAction,
  DeleteContactAction,
  EditContactAction,
  LoadContactsAction,
  LoadLegacyContactsAction,
} from './types';

/**
 * FIXME Remove in future release
 * @deprecated
 */
function* loadLegacyContacts(
  addressBook: PersistentState.Addressbook,
  vault: IEmeraldVault,
  { payload: blockchain }: LoadLegacyContactsAction,
): SagaIterator {
  const items: AddressBookItem[] = yield call(vault.listAddressBook, blockchainCodeToId(blockchain));

  for (const item of items) {
    const contact: PersistentState.AddressbookItem = {
      address: {
        address: item.address.value,
        type: item.address.type === 'single' ? 'plain' : 'xpub',
      },
      blockchain: item.blockchain,
      createTimestamp: item.createdAt,
      label: item.name,
    };

    yield call(addressBook.add, contact);
    yield call(vault.removeFromAddressBook, item.blockchain, item.address.value);
  }
}

function* loadContacts(
  addressBook: PersistentState.Addressbook,
  { payload: blockchain }: LoadContactsAction,
): SagaIterator {
  const { items }: { items: PersistentState.AddressbookItem[] } = yield call(addressBook.query, {
    blockchain: blockchainCodeToId(blockchain),
  });

  yield put(setAddressBook(blockchain, items));
}

function* addContact(
  addressBook: PersistentState.Addressbook,
  { payload: { address, blockchain, label } }: AddContactAction,
): SagaIterator {
  const contact: PersistentState.AddressbookItem = { address, blockchain, label };

  try {
    yield call(addressBook.add, contact);

    yield put(loadAddressBook(blockchainIdToCode(blockchain)));
    yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
  } catch (exception) {
    yield put(screen.actions.showNotification('Cannot save contact! Check address format and try again', 'error'));
  }
}

function* editContact(
  addressBook: PersistentState.Addressbook,
  { payload: { blockchain, id, label } }: EditContactAction,
): SagaIterator {
  if (id != null) {
    yield call(addressBook.update, id, { label });

    yield put(loadAddressBook(blockchainIdToCode(blockchain)));
    yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
  }
}

function* deleteContact(
  addressBook: PersistentState.Addressbook,
  { payload: { blockchain, id } }: DeleteContactAction,
): SagaIterator {
  yield call(addressBook.remove, id);

  yield put(loadAddressBook(blockchain));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

export function* root(addressBook: PersistentState.Addressbook, vault: IEmeraldVault): SagaIterator {
  yield all([
    takeEvery(ActionTypes.LOAD_LEGACY, loadLegacyContacts, addressBook, vault),
    takeEvery(ActionTypes.LOAD, loadContacts, addressBook),
    takeEvery(ActionTypes.ADD_CONTACT, addContact, addressBook),
    takeEvery(ActionTypes.EDIT_CONTACT, editContact, addressBook),
    takeEvery(ActionTypes.DELETE_CONTACT, deleteContact, addressBook),
  ]);
}
