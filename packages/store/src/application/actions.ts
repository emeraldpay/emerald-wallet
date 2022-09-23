import { Commands, Logger } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { ActionTypes, ApplicationOptions, ConnectingAction, OptionsAction } from './types';
import { Dispatched } from '../types';

const log = Logger.forCategory('store.application');

export function agreeOnTerms(version?: string): Dispatched<void> {
  return async (dispatch) => {
    await ipcRenderer.invoke(Commands.SET_TERMS, version);

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

export function getVersions(): Dispatched<unknown> {
  return () => {
    return ipcRenderer.invoke(Commands.GET_VERSION);
  };
}

export function readConfig(): Dispatched<void> {
  return async (dispatch) => {
    const config = await ipcRenderer.invoke(Commands.GET_APP_SETTINGS);

    log.debug(`Got app settings from electron: ${JSON.stringify(config)}`);

    dispatch({
      type: ActionTypes.CONFIG,
      payload: config,
    });
  };
}

export function setOptions(options: ApplicationOptions): OptionsAction {
  return {
    type: ActionTypes.OPTIONS,
    payload: options,
  };
}
