import { IpcCommands, Logger, SettingsOptions, TokenData, Versions } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { ActionTypes, ConnectingAction, OptionsAction, TokensAction } from './types';
import { setAssets } from '../settings/actions';
import { SetAssetsAction } from '../settings/types';
import { Dispatched } from '../types';

const log = Logger.forCategory('Store::Application');

export function agreeOnTerms(version?: string): Dispatched<void> {
  return async (dispatch) => {
    await ipcRenderer.invoke(IpcCommands.SET_TERMS, version);

    dispatch({
      type: ActionTypes.TERMS,
      payload: version,
    });
  };
}

export function connecting(value: boolean): ConnectingAction {
  return {
    type: ActionTypes.CONNECTING,
    payload: value,
  };
}

export function getVersions(): Dispatched<Versions> {
  return () => {
    return ipcRenderer.invoke(IpcCommands.GET_VERSION);
  };
}

export function readConfig(): Dispatched<void> {
  return async (dispatch) => {
    const config = await ipcRenderer.invoke(IpcCommands.GET_APP_SETTINGS);

    log.debug(`Got app settings from electron: ${config}`);

    dispatch({
      type: ActionTypes.CONFIG,
      payload: JSON.parse(config),
    });
  };
}

export function setOptions(options: SettingsOptions): Dispatched<void, OptionsAction> {
  return async (dispatch) => {
    await ipcRenderer.invoke(IpcCommands.SET_OPTIONS, options);

    dispatch({
      type: ActionTypes.OPTIONS,
      payload: options,
    });
  };
}

export function setTokens(tokens: TokenData[]): Dispatched<void, SetAssetsAction | TokensAction> {
  return async (dispatch) => {
    await ipcRenderer.invoke(IpcCommands.SET_TOKENS, tokens);
    await ipcRenderer.invoke(IpcCommands.TXS_SET_TOKENS, tokens);

    await ipcRenderer.invoke(
      IpcCommands.PRICES_SET_ASSETS,
      tokens.map((token) => token.symbol),
    );

    dispatch(setAssets(tokens.map(({ symbol }) => symbol)));

    dispatch({
      type: ActionTypes.TOKENS,
      payload: tokens,
    });
  };
}
