import { IpcCommands } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { SagaIterator } from 'redux-saga';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import * as screen from '../screen';
import { ActionTypes, UpdateSettingsAction } from './types';

function* loadSettings(): SagaIterator {
  if (localStorage) {
    let localeCurrency = localStorage.getItem('localeCurrency');

    if (localeCurrency == null) {
      localeCurrency = 'USD';
    }

    yield put({
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: localeCurrency,
    });

    yield call(ipcRenderer.invoke, IpcCommands.PRICES_SET_CURRENCY, localeCurrency);
  }
}

function* updateSettings(action: UpdateSettingsAction): SagaIterator {
  const settings = action.payload;

  yield put({
    type: ActionTypes.SET_LOCALE_CURRENCY,
    currency: settings.localeCurrency,
  });

  yield put(screen.actions.showNotification('Settings has been saved', 'success'));

  yield call(ipcRenderer.invoke, IpcCommands.PRICES_SET_CURRENCY, settings.localeCurrency);
}

export function* root(): SagaIterator {
  yield takeEvery(ActionTypes.LOAD_SETTINGS, loadSettings);
  yield takeLatest(ActionTypes.UPDATE, updateSettings);
}
