/* @flow */
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
