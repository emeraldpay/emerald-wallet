import { IBackendApi } from '@emeraldwallet/core';
import { select, takeEvery } from 'redux-saga/effects';
import { persistTransactions } from './actions';
import { ActionTypes, IUpdateTxsAction } from './types';

function* processUpdateTxs (backendApi: IBackendApi, action: IUpdateTxsAction) {
  // Persist tx history
  const state = yield select();
  action.payload.forEach((tx) => {
    persistTransactions(state, backendApi, tx.blockchain);
  });
}

export function* root (backendApi: IBackendApi) {
  yield takeEvery(ActionTypes.UPDATE_TXS, processUpdateTxs, backendApi);
}
