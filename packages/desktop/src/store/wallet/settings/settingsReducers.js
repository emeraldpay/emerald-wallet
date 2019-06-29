import Immutable from 'immutable';

import ActionTypes from './actionTypes';

const initial = Immutable.fromJS({
  rates: {},
  localeCurrency: 'USD',
  localeRate: null,
  showHiddenAccounts: false,
  mode: {
    id: 'default',
    chains: ['ETH', 'ETC'],
    currencies: ['USD', 'EUR', 'BTC', 'USDT'],
  },
});

function onSetLocaleCurrency(state, action) {
  if (action.type === ActionTypes.SET_LOCALE_CURRENCY) {
    const currency = action.currency.toUpperCase();
    const rate = state.get('rates', {}).get(currency);

    // persist settings
    if (localStorage) {
      localStorage.setItem('localeCurrency', currency);
    }

    return state
      .set('localeCurrency', currency)
      .set('localeRate', rate);
  }
  return state;
}

function onExchangeRates(state, action) {
  if (action.type === ActionTypes.EXCHANGE_RATES) {
    return state
      .set('rates', Immutable.fromJS(action.rates))
      .set('localeRate', action.rates ? action.rates.ETC : null);
  }
  return state;
}

function onSetShowHiddenAccounts(state, action) {
  if (action.type === ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS) {
    // persist settings
    if (localStorage) {
      localStorage.setItem('showHiddenAccounts', action.show);
    }
    return state.set('showHiddenAccounts', action.show);
  }
  return state;
}

function onSetConfirmations(state, action) {
  if (action.type === ActionTypes.NUM_CONFIRMATIONS) {
    // persist settings
    if (localStorage) {
      localStorage.setItem('numConfirmations', action.numConfirmations);
    }
    return state.set('numConfirmations', action.numConfirmations);
  }
  return state;
}

function onSetMode(state, action) {
  if (action.type === ActionTypes.MODE) {
    return state.set('mode', Immutable.fromJS(action.payload));
  }
  return state;
}

export default function accountsReducers(state, action) {
  state = state || initial;
  state = onSetLocaleCurrency(state, action);
  state = onExchangeRates(state, action);
  state = onSetShowHiddenAccounts(state, action);
  state = onSetConfirmations(state, action);
  state = onSetMode(state, action);
  return state;
}
