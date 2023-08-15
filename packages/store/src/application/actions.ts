import { IpcCommands, Logger, SettingsOptions, TokenData, Versions } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { txhistory } from '../index';
import { UpdateTxTokensAction } from '../txhistory/types';
import { Dispatched } from '../types';
import { ActionTypes, ConnectingAction, OptionsAction, TokensAction } from './types';

const log = Logger.forCategory('Store::Application');

export function agreeOnTerms(version?: string): Dispatched {
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
  return () => ipcRenderer.invoke(IpcCommands.GET_VERSION);
}

export function readConfig(): Dispatched {
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

export function setTokens(
  tokens: TokenData[],
  changed: boolean,
): Dispatched<void, TokensAction | UpdateTxTokensAction> {
  return async (dispatch) => {
    if (changed) {
      await ipcRenderer.invoke(IpcCommands.ALLOWANCE_SET_TOKENS, tokens);
      await ipcRenderer.invoke(IpcCommands.BALANCE_SET_TOKENS, tokens);
      await ipcRenderer.invoke(IpcCommands.TOKENS_SET_TOKENS, tokens);
      await ipcRenderer.invoke(IpcCommands.TXS_SET_TOKENS, tokens);
    }

    await ipcRenderer.invoke(IpcCommands.SET_TOKENS, tokens);

    dispatch({ type: ActionTypes.TOKENS, payload: tokens });

    dispatch(txhistory.actions.updateTransactionTokens(tokens));
  };
}

export function cacheGet(id: string): Dispatched<string | null> {
  return (dispatch, getState, extra) => extra.api.cache.get(id);
}

export function cachePut(id: string, value: string, ttl?: number): Dispatched {
  return (dispatch, getState, extra) => extra.api.cache.put(id, value, ttl);
}

export function fsReadFile(filePath: string): Dispatched<Uint8Array | null> {
  return () => ipcRenderer.invoke(IpcCommands.FS_READ_FILE, filePath);
}
