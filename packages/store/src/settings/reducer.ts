import { BlockchainCode, CurrencyCode, StableCoinCode } from '@emeraldwallet/core';
import {
  ActionTypes,
  ISetExchRatesAction,
  ISetModeAction,
  ISettingsState,
  SetLocaleCurrencyAction,
  SettingsAction
} from './types';

const initial: ISettingsState = {
  rates: {},
  localeCurrency: CurrencyCode.USD,
  localeRate: undefined,
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

  return { ...state, localeCurrency: currency as CurrencyCode, rates: {} };
}

function onExchangeRates (state: ISettingsState, action: ISetExchRatesAction): ISettingsState {
  const { rates } = action.payload;
  return { ...state, rates, localeRate: rates ? rates.ETH : undefined };

}

function onSetMode (state: ISettingsState, action: ISetModeAction): ISettingsState {
  return { ...state, mode: action.payload };
}

export default function reducer (state: ISettingsState | undefined, action: SettingsAction): ISettingsState {
  state = state || initial;
  switch (action.type) {
    case ActionTypes.MODE:
      return onSetMode(state, action);
    case ActionTypes.SET_LOCALE_CURRENCY:
      return onSetLocaleCurrency(state, action);
    case ActionTypes.EXCHANGE_RATES:
      return onExchangeRates(state, action);
  }
  return state;
}
