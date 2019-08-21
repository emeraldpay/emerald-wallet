import {takeEvery, select, put} from 'redux-saga/effects';
import {ActionTypes, UpdateTxsAction} from "./types";
import {persistTransactions} from "./actions";
import {Blockchains} from "@emeraldwallet/core";

function* processUpdateTxs(action: UpdateTxsAction) {
  // Persist tx history
  const state = yield select();
  action.payload.forEach((tx) => {
    const chainId = Blockchains[tx.blockchain].params.chainId;
    persistTransactions(state, chainId);
  });
}

export function* root() {
  yield takeEvery(ActionTypes.UPDATE_TXS, processUpdateTxs)
}
