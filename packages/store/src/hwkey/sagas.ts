import {all, call, put, select, takeEvery, takeLatest} from 'redux-saga/effects';
import {SagaIterator} from "redux-saga";
import {IEmeraldVault} from '@emeraldpay/emerald-vault-core';
import {LedgerDetails} from "@emeraldpay/emerald-vault-core";
import {setLedger} from "./actions";
import {ActionTypes} from './types';

function* checkLedger(vault: IEmeraldVault): SagaIterator {
  // first, make sure that a Ledger is connected, otherwise .getConnectedHWDetails gives an error
  const connected = yield call([vault, vault.isSeedAvailable], {type: "ledger"})
  if (connected) {
    try {
      const details: LedgerDetails[] = yield call([vault, vault.getConnectedHWDetails]);
      for (const conn of details) {
        yield put(setLedger(conn.connected, conn.app))
      }
    } catch (e) {
      console.warn("Ledger is not connected", e)
      yield put(setLedger(false, null))
    }
  } else {
    yield put(setLedger(false, null))
  }
}

export function* root(vault: IEmeraldVault) {
  yield all([
    takeEvery(ActionTypes.CHECK_LEDGER, checkLedger, vault)
  ]);
}
