import { fromJS } from 'immutable';
import {
  ActionTypes,
  ISetExchRatesAction, ISettingsState,
  SetLocaleCurrencyAction,
  SetModeAction,
  SetNumConfirmAction,
  SetShowHiddenAccsAction,
  SettingsAction
} from './types';

const initial = fromJS({
  rates: {},
  localeCurrency: 'USD',
  localeRate: null,
  showHiddenAccounts: false,
  mode: {
    id: 'default',
    chains: ['ETH', 'ETC'],
    currencies: ['USD', 'EUR', 'BTC', 'USDT']
  }
});

function onSetLocaleCurrency (state: ISettingsState, action: SetLocaleCurrencyAction) {
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

function onExchangeRates (state: ISettingsState, action: ISetExchRatesAction) {
  return state
    .set('rates', fromJS(action.rates))
    .set('localeRate', action.rates ? action.rates.ETC : null);

}

function onSetShowHiddenAccounts (state: ISettingsState, action: SetShowHiddenAccsAction) {
  // persist settings
  if (localStorage) {
    localStorage.setItem('showHiddenAccounts', action.show);
  }
  return state.set('showHiddenAccounts', action.show);
}

function onSetConfirmations (state: ISettingsState, action: SetNumConfirmAction) {
  // persist settings
  if (localStorage) {
    localStorage.setItem('numConfirmations', action.numConfirmations);
  }
  return state.set('numConfirmations', action.numConfirmations);
}

function onSetMode (state: ISettingsState, action: SetModeAction) {
  return state.set('mode', fromJS(action.payload));
}

export default function reducer (state: ISettingsState, action: SettingsAction) {
  state = state || initial;
  switch (action.type) {
    case ActionTypes.MODE:
      return onSetMode(state, action);
    case ActionTypes.NUM_CONFIRMATIONS:
      return onSetConfirmations(state, action);
    case ActionTypes.SET_LOCALE_CURRENCY:
      return onSetLocaleCurrency(state, action);
    case ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS:
      return onSetShowHiddenAccounts(state, action);
    case ActionTypes.EXCHANGE_RATES:
      return onExchangeRates(state, action);
  }
  return state;
}
