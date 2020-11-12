import {all, call, put, select, takeEvery, takeLatest} from 'redux-saga/effects';
import {SagaIterator} from "redux-saga";
import {IEmeraldVault} from '@emeraldpay/emerald-vault-core';
import {LedgerDetails} from "@emeraldpay/emerald-vault-core";
import {setLedger} from "./actions";
import {ActionTypes} from './types';

function* checkLedger(vault: IEmeraldVault): SagaIterator {
  const details: LedgerDetails[] = yield call([vault, vault.getConnectedHWDetails]);
  for (const conn of details) {
    yield put(setLedger(conn.connected, conn.app))
  }
}

export function* root(vault: IEmeraldVault) {
  yield all([
    takeEvery(ActionTypes.CHECK_LEDGER, checkLedger, vault)
  ]);
}
