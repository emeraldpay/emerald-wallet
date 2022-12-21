import { BlockchainCode, CurrencyCode } from '@emeraldwallet/core';

export enum ActionTypes {
  EXCHANGE_RATES = 'ACCOUNT/EXCHANGE_RATES',
  LOAD_SETTINGS = 'SETTINGS/LOAD',
  SET_LOCALE_CURRENCY = 'ACCOUNT/SET_LOCALE_CURRENCY',
  SET_ASSETS = 'SETTINGS/SET_ASSETS',
  SET_MODE = 'SETTINGS/SET_MODE',
  UPDATE = 'SETTINGS/UPDATE',
}

export interface Settings {
  language: string;
  localeCurrency: string;
}

export interface Mode {
  assets: string[];
  chains: BlockchainCode[];
  id: string;
}

export interface Rates {
  [key: string]: string;
}

export interface SettingsState {
  localeCurrency: CurrencyCode;
  localeRate?: string;
  mode: Mode;
  rates: Rates;
}

export interface LoadSettingsAction {
  type: ActionTypes.LOAD_SETTINGS;
}

export interface SetAssetsAction {
  type: ActionTypes.SET_ASSETS;
  payload: string[];
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
  type: ActionTypes.EXCHANGE_RATES;
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
  | SetAssetsAction
  | SetExchangeRatesAction
  | SetLocaleCurrencyAction
  | SetModeAction
  | UpdateSettingsAction;
