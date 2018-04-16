// @flow
import { getRates } from '../../../lib/marketApi';
import ActionTypes from './actionTypes';
import screen from '../screen';

export function loadSettings() {
  return (dispatch, getState) => {
    if (localStorage) {
      let localeCurrency = localStorage.getItem('localeCurrency');
      localeCurrency = (localeCurrency === null) ? 'USD' : localeCurrency;
      dispatch({
        type: ActionTypes.SET_LOCALE_CURRENCY,
        currency: localeCurrency,
      });

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

export function getExchangeRates() {
  return (dispatch) => {
    getRates.call().then((result) => {
      dispatch({
        type: ActionTypes.EXCHANGE_RATES,
        rates: result,
      });
    });
  };
}

export function update(settings: { language: string, localeCurrency: string, showHiddenAccounts: boolean, numConfirmations: number }) {
  return (dispatch, getState) => {
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
