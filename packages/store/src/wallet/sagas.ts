import { Wallet } from '@emeraldpay/emerald-vault-core';
import { SagaIterator } from 'redux-saga';
import { put, select, takeEvery } from 'redux-saga/effects';
import { ActionTypes, IOpenAccDetailsAction } from './types';
import * as addresses from '../accounts';
import * as screen from '../screen';

function* openAccountDetails(action: IOpenAccDetailsAction): SagaIterator {
  const { address, chain } = action.payload;

  const wallet: Wallet = yield select(addresses.selectors.findWalletByAddress, address, chain);

  if (!wallet) {
    yield put(
      screen.actions.showNotification(`Account ${address} not found in the vault`, 'warning', 3000, null, null),
    );
  } else {
    yield put(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
  }
}

export function* root(): SagaIterator {
  yield takeEvery(ActionTypes.OPEN_ACCOUNT_DETAILS, openAccountDetails);
}
