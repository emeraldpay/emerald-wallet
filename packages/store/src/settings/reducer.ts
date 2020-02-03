import { BlockchainCode, CurrencyCode, StableCoinCode } from '@emeraldwallet/core';
import {
  ActionTypes,
  ISetExchRatesAction,
  ISetModeAction,
  ISettingsState,
  SetLocaleCurrencyAction,
  SetNumConfirmAction,
  SettingsAction
} from './types';

const initial: ISettingsState = {
  rates: {},
  localeCurrency: CurrencyCode.USD,
  localeRate: undefined,
  numConfirmations: 12,
  mode: {
    id: 'default',
    chains: [BlockchainCode.ETH, BlockchainCode.ETC],
    currencies: [CurrencyCode.USD, CurrencyCode.EUR, 'USDT']
  }
};

function onSetLocaleCurrency (state: ISettingsState, action: SetLocaleCurrencyAction) {
  const currency = action.currency.toUpperCase();

  // persist settings
  if (localStorage) {
    localStorage.setItem('localeCurrency', currency);
  }

  return { ...state, localeCurrency: currency, rates: {} };
}

function onExchangeRates (state: ISettingsState, action: ISetExchRatesAction) {
  const { rates } = action.payload;
  return { ...state, rates, localRate: rates ? rates.ETH : undefined };

}

function onSetConfirmations (state: ISettingsState, action: SetNumConfirmAction) {
  // persist settings
  if (localStorage) {
    localStorage.setItem('numConfirmations', action.numConfirmations.toString());
  }
  return { ...state, numConfirmations: action.numConfirmations };
}

function onSetMode (state: ISettingsState, action: ISetModeAction) {
  return { ...state, mode: action.payload };
}

export default function reducer (state: ISettingsState | undefined, action: SettingsAction) {
  state = state || initial;
  switch (action.type) {
    case ActionTypes.MODE:
      return onSetMode(state, action);
    case ActionTypes.NUM_CONFIRMATIONS:
      return onSetConfirmations(state, action);
    case ActionTypes.SET_LOCALE_CURRENCY:
      return onSetLocaleCurrency(state, action);
    case ActionTypes.EXCHANGE_RATES:
      return onExchangeRates(state, action);
  }
  return state;
}
