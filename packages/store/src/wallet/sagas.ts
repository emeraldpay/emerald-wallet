import { IApi } from '@emeraldwallet/core';
import { all, put, select, takeEvery } from 'redux-saga/effects';
import * as addresses from '../accounts';
import * as screen from '../screen';
import { ActionTypes, IOpenAccDetailsAction } from './types';

function* openAccountDetails (api: IApi, action: IOpenAccDetailsAction) {
  const { address, chain } = action.payload;
  const wallet: any = yield select(addresses.selectors.findWalletByAddress, address, chain);
  if (!wallet) {
    yield put(screen.actions.showNotification(
      `Account ${address} not found in the vault`, 'warning', 3000, '', () => {}));
  } else {
    yield put(screen.actions.gotoScreen(screen.Pages.WALLET, wallet));
  }
}

function* watchOpenAccDetails (api: IApi) {
  yield takeEvery(ActionTypes.OPEN_ACCOUNT_DETAILS, openAccountDetails, api);
}

export function* root (api: IApi) {
  yield all([
    watchOpenAccDetails(api)
  ]);
}
