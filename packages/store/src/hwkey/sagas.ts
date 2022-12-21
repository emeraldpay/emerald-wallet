import { IEmeraldVault, LedgerDetails } from '@emeraldpay/emerald-vault-core';
import { SagaIterator } from 'redux-saga';
import { all, call, put, takeEvery } from 'redux-saga/effects';
import { setLedger } from './actions';
import { ActionTypes } from './types';

function* checkLedger(vault: IEmeraldVault): SagaIterator {
  /**
   * First, make sure that a Ledger is connected, otherwise `getConnectedHWDetails` gives an error
   */
  const connected = yield call([vault, vault.isSeedAvailable], { type: 'ledger' });

  if (connected) {
    try {
      const details: LedgerDetails[] = yield call([vault, vault.getConnectedHWDetails]);

      for (const { app, connected } of details) {
        yield put(setLedger(connected, app));
      }
    } catch (exception) {
      console.warn('Ledger is not connected', exception);

      yield put(setLedger(false, null));
    }
  } else {
    yield put(setLedger(false, null));
  }
}

export function* root(vault: IEmeraldVault): SagaIterator {
  yield all([takeEvery(ActionTypes.CHECK_LEDGER, checkLedger, vault)]);
}
