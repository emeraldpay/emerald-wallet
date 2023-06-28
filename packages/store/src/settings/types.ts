import { BlockchainCode, CurrencyCode } from '@emeraldwallet/core';

export enum ActionTypes {
  LOAD_SETTINGS = 'SETTINGS/LOAD',
  SET_LOCALE_CURRENCY = 'ACCOUNT/SET_LOCALE_CURRENCY',
  SET_MODE = 'SETTINGS/SET_MODE',
  SET_RATES = 'ACCOUNT/SET_RATES',
  UPDATE = 'SETTINGS/UPDATE',
}

export interface Mode {
  chains: BlockchainCode[];
  id: string;
}

export interface Rates {
  [key: string]: string;
}

export interface Settings {
  language: string;
  localeCurrency: string;
}

export interface SettingsState {
  localeCurrency: CurrencyCode;
  mode: Mode;
  rates: Rates;
}

export interface LoadSettingsAction {
  type: ActionTypes.LOAD_SETTINGS;
}

export interface SetModeAction {
  type: ActionTypes.SET_MODE;
  payload: Mode;
}

export interface SetLocaleCurrencyAction {
  type: ActionTypes.SET_LOCALE_CURRENCY;
  currency: string;
}

export interface SetExchangeRatesAction {
  type: ActionTypes.SET_RATES;
  payload: {
    rates: Rates;
  };
}

export interface UpdateSettingsAction {
  type: ActionTypes.UPDATE;
  payload: Settings;
}

export type SettingsAction =
  | LoadSettingsAction
  | SetExchangeRatesAction
  | SetLocaleCurrencyAction
  | SetModeAction
  | UpdateSettingsAction;
