import { BlockchainCode, CurrencyCode, StableCoinCode } from '@emeraldwallet/core';

export enum ActionTypes {
  SET_LOCALE_CURRENCY = 'ACCOUNT/SET_LOCALE_CURRENCY',
  EXCHANGE_RATES = 'ACCOUNT/EXCHANGE_RATES',
  MODE = 'SETTINGS/MODE',
  LOAD_SETTINGS = 'SETTINGS/LOAD',
  UPDATE = 'SETTINGS/UPDATE'
}

export interface Rates {[key: string]: string}

export interface ISettingsState {
  localeCurrency: CurrencyCode;
  localeRate?: string;
  mode: {
    chains: BlockchainCode[];
    currencies: Array<CurrencyCode | StableCoinCode>;
    id: string;
  };
  rates: Rates;
}

export interface ILoadSettingsAction {
  type: ActionTypes.LOAD_SETTINGS;
}

export interface IUpdateSettingsAction {
  type: ActionTypes.UPDATE;
  payload: any;
}

export interface ISetModeAction {
  type: ActionTypes.MODE;
  payload: any;
}

export interface SetLocaleCurrencyAction {
  type: ActionTypes.SET_LOCALE_CURRENCY;
  currency: string;
}

export interface ISetExchRatesAction {
  type: ActionTypes.EXCHANGE_RATES;
  payload: {
    rates: Rates;
  };
}

export type SettingsAction =
  ISetModeAction |
  SetLocaleCurrencyAction |
  ISetExchRatesAction |
  ILoadSettingsAction |
  IUpdateSettingsAction;
