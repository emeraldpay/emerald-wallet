import { Blockchains } from '@emeraldwallet/core';
import { put, select, takeEvery } from 'redux-saga/effects';
import { persistTransactions } from './actions';
import { ActionTypes, UpdateTxsAction } from './types';

function* processUpdateTxs (action: UpdateTxsAction) {
  // Persist tx history
  const state = yield select();
  action.payload.forEach((tx) => {
    const chainId = Blockchains[tx.blockchain].params.chainId;
    persistTransactions(state, chainId);
  });
}

export function* root () {
  yield takeEvery(ActionTypes.UPDATE_TXS, processUpdateTxs);
}
