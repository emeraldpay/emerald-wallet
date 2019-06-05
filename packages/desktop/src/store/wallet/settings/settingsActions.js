// @flow
// import { getRates } from '../../../lib/marketApi';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import ActionTypes from './actionTypes';
import { screen } from '../..';
import createLogger from '../../../utils/logger';

const log = createLogger('settingsActions');

export function loadSettings() {
  log.debug('Loading settings...');
  return (dispatch, getState) => {
    if (localStorage) {
      log.debug('Found local storage.');
      let localeCurrency = localStorage.getItem('localeCurrency');
      localeCurrency = (localeCurrency === null) ? 'USD' : localeCurrency;
      dispatch({
        type: ActionTypes.SET_LOCALE_CURRENCY,
        currency: localeCurrency,
      });
      ipcRenderer.send('prices/setCurrency', localeCurrency);

      const localStorageShowHiddenAccounts = localStorage.getItem('showHiddenAccounts') || 'false';
      const showHiddenAccounts = JSON.parse(localStorageShowHiddenAccounts);
      dispatch({
        type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS,
        show: showHiddenAccounts,
      });

      const numConfirmations = localStorage.getItem('numConfirmations') || 12;
      dispatch({
        type: ActionTypes.NUM_CONFIRMATIONS,
        numConfirmations: parseInt(numConfirmations, 10),
      });
    }
  };
}

export function listenPrices() {
  return (dispatch, getState) => {
    ipcRenderer.on('prices/rate', (event, rates) => {
      dispatch({
        type: ActionTypes.EXCHANGE_RATES,
        rates,
      });
    });
  };
}

export function update(settings: { language: string, localeCurrency: string, showHiddenAccounts: boolean, numConfirmations: number }) {
  return (dispatch, getState) => {
    ipcRenderer.send('prices/setCurrency', settings.localeCurrency);
    return Promise.all([
      dispatch({
        type: ActionTypes.SET_LOCALE_CURRENCY,
        currency: settings.localeCurrency,
      }),
      dispatch({
        type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS,
        show: settings.showHiddenAccounts,
      }),
      dispatch({
        type: ActionTypes.NUM_CONFIRMATIONS,
        numConfirmations: parseInt(settings.numConfirmations, 10),
      }),
    ]).then(() => {
      return dispatch(screen.actions.showNotification('Settings has been saved', 'success', 3000));
    });
  };
}
