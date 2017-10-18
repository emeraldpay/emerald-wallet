// @flow 
import { getRates } from '../../../lib/marketApi';
import ActionTypes from './actionTypes';

export function loadSettings() {
    return (dispatch) => {
        if (localStorage) {
            let localeCurrency = localStorage.getItem('localeCurrency');
            localeCurrency = (localeCurrency === null) ? 'USD' : localeCurrency;
            dispatch({
                type: ActionTypes.SET_LOCALE_CURRENCY,
                currency: localeCurrency,
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
        dispatch({
            type: ActionTypes.SET_LOCALE_CURRENCY,
            currency: settings.localeCurrency,
        });
        return dispatch({
            type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS,
            show: settings.showHiddenAccounts,
        });
    };
}
