// @flow
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import ActionTypes from './actionTypes';
import { screen } from '../..';
import createLogger from '../../../utils/logger';

const log = createLogger('settingsActions');

// TODO: move to store/settings

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


