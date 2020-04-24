import {
  ActionTypes,
  ILoadSettingsAction,
  ISetExchRatesAction,
  IUpdateSettingsAction
} from './types';

export interface ISettings {
  language: string;
  localeCurrency: string;
  numConfirmations: string;
}

export function loadSettings (): ILoadSettingsAction {
  return {
    type: ActionTypes.LOAD_SETTINGS
  };
}

export function updateSettings (settings: ISettings): IUpdateSettingsAction {
  return {
    type: ActionTypes.UPDATE,
    payload: settings
  };
}

export function setRatesAction (rates: any): ISetExchRatesAction {
  return {
    type: ActionTypes.EXCHANGE_RATES,
    payload: {
      rates
    }
  };
}
