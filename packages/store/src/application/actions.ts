import { Logger } from '@emeraldwallet/core';
import { ipcRenderer, remote } from 'electron';
import { ActionTypes, IConfigAction, ISetConnectingAction } from './types';

const log = Logger.forCategory('store.application');

export function agreeOnTerms (v: any) {
  ipcRenderer.send('terms', v);
  return {
    type: 'LAUNCHER/TERMS',
    version: v
  };
}

export function connecting (value: boolean): ISetConnectingAction {
  return {
    type: ActionTypes.SET_CONNECTING,
    payload: value
  };
}

export function readConfig (): IConfigAction {
  if (typeof window.process !== 'undefined') {
    const launcherConfig = remote.getGlobal('launcherConfig').get();

    log.debug(`Got launcher config from electron: ${JSON.stringify(launcherConfig)}`);

    return {
      type: ActionTypes.CONFIG,
      payload: launcherConfig
    };
  }
  return {
    type: ActionTypes.CONFIG,
    payload: {}
  };
}
