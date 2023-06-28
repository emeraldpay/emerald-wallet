import { Dispatched } from '../types';
import {
  ActionTypes,
  LoadSettingsAction,
  Rates,
  SetExchangeRatesAction,
  Settings,
  UpdateSettingsAction,
} from './types';

export function exportVaultFile(sourceFile: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.snapshotCreate(sourceFile);
}

export function importVaultFile(targetFile: string, password: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.snapshotRestore(targetFile, password);
}

export function loadSettings(): LoadSettingsAction {
  return {
    type: ActionTypes.LOAD_SETTINGS,
  };
}

export function setRates(rates: Rates): SetExchangeRatesAction {
  return {
    type: ActionTypes.SET_RATES,
    payload: {
      rates,
    },
  };
}

export function updateSettings(settings: Settings): UpdateSettingsAction {
  return {
    type: ActionTypes.UPDATE,
    payload: settings,
  };
}
