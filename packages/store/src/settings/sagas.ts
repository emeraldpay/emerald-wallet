import { ipcRenderer } from 'electron';
import { put, takeEvery } from 'redux-saga/effects';
import { ActionTypes, ILoadSettingsAction } from './types';

function* loadSettings (action: ILoadSettingsAction) {
  if (localStorage) {
    let localeCurrency = localStorage.getItem('localeCurrency');
    localeCurrency = (localeCurrency === null) ? 'USD' : localeCurrency;
    const localStorageShowHiddenAccounts = localStorage.getItem('showHiddenAccounts') || 'false';
    const showHiddenAccounts = JSON.parse(localStorageShowHiddenAccounts);
    const numConfirmations = localStorage.getItem('numConfirmations') || '12';

    // TODO: following three put() calls can be replaced by one action dispatch
    yield put({
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: localeCurrency
    });
    yield put({
      type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS,
      show: showHiddenAccounts
    });
    yield put({
      type: ActionTypes.NUM_CONFIRMATIONS,
      numConfirmations: parseInt(numConfirmations, 10)
    });

    ipcRenderer.send('prices/setCurrency', localeCurrency);
  }
}

export function* root () {
  yield takeEvery(ActionTypes.LOAD_SETTINGS, loadSettings);
}
