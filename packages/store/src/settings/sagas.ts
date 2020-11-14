import { ipcRenderer } from 'electron';
import { put, takeEvery, takeLatest } from 'redux-saga/effects';
import * as screen from '../screen';
import { ActionTypes, ILoadSettingsAction, IUpdateSettingsAction } from './types';

function* loadSettings (action: ILoadSettingsAction) {
  if (localStorage) {
    let localeCurrency = localStorage.getItem('localeCurrency');
    localeCurrency = (localeCurrency === null) ? 'USD' : localeCurrency;

    yield put({
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: localeCurrency
    });

    ipcRenderer.send('prices/setCurrency', localeCurrency);
  }
}

function* updateSettings (action: IUpdateSettingsAction) {
  const settings = action.payload;

  yield put({
    currency: settings.localeCurrency,
    type: ActionTypes.SET_LOCALE_CURRENCY
  });

  yield put(screen.actions.showNotification('Settings has been saved', 'success', 3000, null, null));

  ipcRenderer.send('prices/setCurrency', settings.localeCurrency);
}

export function* root () {
  yield takeEvery(ActionTypes.LOAD_SETTINGS, loadSettings);
  yield takeLatest(ActionTypes.UPDATE, updateSettings);
}
