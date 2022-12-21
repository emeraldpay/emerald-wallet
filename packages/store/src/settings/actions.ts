import {
  ActionTypes,
  LoadSettingsAction,
  Rates,
  SetAssetsAction,
  SetExchangeRatesAction,
  Settings,
  UpdateSettingsAction,
} from './types';
import { Dispatched } from '../types';

export function loadSettings(): LoadSettingsAction {
  return {
    type: ActionTypes.LOAD_SETTINGS,
  };
}

export function setAssets(assets: string[]): SetAssetsAction {
  return {
    type: ActionTypes.SET_ASSETS,
    payload: assets,
  };
}

export function setRates(rates: Rates): SetExchangeRatesAction {
  return {
    type: ActionTypes.EXCHANGE_RATES,
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

export function importVaultFile(targetFile: string, password: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.snapshotRestore(targetFile, password);
}

export function exportVaultFile(sourceFile: string): Dispatched<boolean> {
  return (dispatch, getState, extra) => extra.api.vault.snapshotCreate(sourceFile);
}
