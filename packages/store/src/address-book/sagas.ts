import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { AddressBookItem } from '@emeraldpay/emerald-vault-core/lib/types';
import { blockchainCodeToId, PersistentState } from '@emeraldwallet/core';
import { SagaIterator } from 'redux-saga';
import { call, put, takeEvery } from 'redux-saga/effects';
import * as screen from '../screen';
import { contactDeletedAction, newContactAddedAction, setAddressBook } from './actions';
import {
  ActionTypes,
  AddContactAction,
  DeleteContactAction,
  ILoadContactsAction,
  LoadLegacyContactsAction,
} from './types';

function* loadAddresses(
  addressBook: PersistentState.Addressbook,
  { payload: blockchain }: ILoadContactsAction,
): SagaIterator {
  const { items }: { items: PersistentState.AddressbookItem[] } = yield call(addressBook.query, {
    blockchain: blockchainCodeToId(blockchain),
  });

  yield put(setAddressBook(blockchain, items));
}

function* addContact(
  addressBook: PersistentState.Addressbook,
  { payload: { address, blockchain, description, label } }: AddContactAction,
): SagaIterator {
  const contact: PersistentState.AddressbookItem = { address, blockchain, description, label };

  const id = yield call(addressBook.add, contact);

  yield put(newContactAddedAction({ ...contact, id }));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

function* deleteContact(
  addressBook: PersistentState.Addressbook,
  { payload: { blockchain, id } }: DeleteContactAction,
): SagaIterator {
  yield call(addressBook.remove, id);

  yield put(contactDeletedAction(blockchain, id));
  yield put(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
}

/**
 * FIXME Remove in future release
 * @deprecated
 */
function* loadLegacyAddresses(
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
      description: item.description,
      label: item.name,
    };

    yield call(addressBook.add, contact);
    yield call(vault.removeFromAddressBook, item.blockchain, item.address.value);
  }
}

export function* root(addressBook: PersistentState.Addressbook, vault: IEmeraldVault): SagaIterator {
  yield takeEvery(ActionTypes.LOAD, loadAddresses, addressBook);
  yield takeEvery(ActionTypes.LOAD_LEGACY, loadLegacyAddresses, addressBook, vault);
  yield takeEvery(ActionTypes.ADD_CONTACT, addContact, addressBook);
  yield takeEvery(ActionTypes.DELETE_ADDRESS, deleteContact, addressBook);
}
