export enum ActionTypes {
  SET_LOCALE_CURRENCY = 'ACCOUNT/SET_LOCALE_CURRENCY',
  EXCHANGE_RATES = 'ACCOUNT/EXCHANGE_RATES',
  SET_SHOW_HIDDEN_ACCOUNTS = 'SETTINGS/SET_SHOW_HIDDEN_ACCOUNTS',
  NUM_CONFIRMATIONS = 'SETTINGS/NUM_CONFIRMATIONS',
  MODE = 'SETTINGS/MODE'
}

export type ISettingsState = any;

export interface SetModeAction {
  type: ActionTypes.MODE;
  payload: any;
}

export interface SetNumConfirmAction {
  type: ActionTypes.NUM_CONFIRMATIONS;
  numConfirmations: any;
}

export interface SetLocaleCurrencyAction {
  type: ActionTypes.SET_LOCALE_CURRENCY;
  currency: any;
}

export interface SetShowHiddenAccsAction {
  type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS;
  show: any;
}

export interface SetExchRatesAction {
  type: ActionTypes.EXCHANGE_RATES;
  rates: any;
}

export type SettingsAction =
  SetModeAction |
  SetNumConfirmAction |
  SetLocaleCurrencyAction |
  SetShowHiddenAccsAction |
  SetExchRatesAction;
