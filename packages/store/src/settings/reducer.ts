import { CurrencyCode } from '@emeraldwallet/core';
import {
  ActionTypes,
  SetExchangeRatesAction,
  SetLocaleCurrencyAction,
  SetModeAction,
  SettingsAction,
  SettingsState,
} from './types';

const INITIAL_STATE: SettingsState = {
  localeCurrency: CurrencyCode.USD,
  mode: {
    id: 'default',
    chains: [],
  },
  rates: {},
};

function onExchangeRates(state: SettingsState, action: SetExchangeRatesAction): SettingsState {
  const { rates } = action.payload;

  return { ...state, rates };
}

function onSetMode(state: SettingsState, action: SetModeAction): SettingsState {
  return { ...state, mode: action.payload };
}

function onSetLocaleCurrency(state: SettingsState, action: SetLocaleCurrencyAction): SettingsState {
  const currency = action.currency.toUpperCase();

  if (localStorage != null) {
    localStorage.setItem('localeCurrency', currency);
  }

  return { ...state, localeCurrency: currency as CurrencyCode, rates: {} };
}

export default function reducer(state = INITIAL_STATE, action: SettingsAction): SettingsState {
  switch (action.type) {
    case ActionTypes.SET_RATES:
      return onExchangeRates(state, action);
    case ActionTypes.SET_MODE:
      return onSetMode(state, action);
    case ActionTypes.SET_LOCALE_CURRENCY:
      return onSetLocaleCurrency(state, action);
    default:
      return state;
  }
}
