import Immutable from 'immutable';

import ActionTypes from './actionTypes';

const initial = Immutable.fromJS({
    rates: {},
    localeCurrency: 'USD',
    localeRate: null,
});

function onSetLocaleCurrency(state, action) {
    if (action.type === ActionTypes.SET_LOCALE_CURRENCY) {
        const currency = action.currency;
        const rate = state.get('rates', {}).get(currency.toLowerCase());

        // persist settings
        localStorage.setItem('localeCurrency', currency);

        return state
            .set('localeCurrency', currency)
            .set('localeRate', rate);
    }
    return state;
}

function onExchangeRates(state, action) {
    if (action.type === ActionTypes.EXCHANGE_RATES) {
        const localeRate = action.rates[state.get('localeCurrency').toLowerCase()];
        return state
            .set('rates', Immutable.fromJS(action.rates))
            .set('localeRate', localeRate);
    }
    return state;
}

export default function accountsReducers(state, action) {
    state = state || initial;
    state = onSetLocaleCurrency(state, action);
    state = onExchangeRates(state, action);
    return state;
}
