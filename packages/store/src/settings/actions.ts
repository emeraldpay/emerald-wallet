import { Dispatched } from '../types';
import { ActionTypes, ILoadSettingsAction, ISetExchRatesAction, IUpdateSettingsAction, Rates } from './types';

export interface Settings {
  language: string;
  localeCurrency: string;
}

export function loadSettings(): ILoadSettingsAction {
  return {
    type: ActionTypes.LOAD_SETTINGS,
  };
}

export function updateSettings(settings: Settings): IUpdateSettingsAction {
  return {
    type: ActionTypes.UPDATE,
    payload: settings,
  };
}

export function setRatesAction(rates: Rates): ISetExchRatesAction {
  return {
    type: ActionTypes.EXCHANGE_RATES,
    payload: {
      rates,
    },
  };
}

export function importVaultFile(targetFile: string, password: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.snapshotRestore(targetFile, password);
}

export function exportVaultFile(sourceFile: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.snapshotCreate(sourceFile);
}
