// @flow
import { getRates } from '../../../lib/marketApi';
import ActionTypes from './actionTypes';
import screen from '../screen';

export function loadSettings() {
  return (dispatch) => {
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

export function updateLocaleCurrency(currency: string) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency,
    });
  };
}

export function update(settings: { localeCurrency: string, showHiddenAccounts: boolean }) {
  return (dispatch) => {
    return Promise.all([
      dispatch({
        type: ActionTypes.SET_LOCALE_CURRENCY,
        currency: settings.localeCurrency,
      }),
      dispatch({
        type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS,
        show: settings.showHiddenAccounts,
      }),
    ]).then(() => {
      return dispatch(screen.actions.showNotification('Saved settings.', 'success', 3000));
    }).then(() => {
      // reset redux notification message
      return dispatch(screen.actions.closeNotification());
    });
  };
}
