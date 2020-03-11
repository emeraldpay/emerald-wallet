import { Commands, Logger } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { ActionTypes, IConfigAction, ISetConnectingAction } from './types';

const log = Logger.forCategory('store.application');

export function agreeOnTerms (v: any): any {
  return async (dispatch: any) => {
    await ipcRenderer.invoke(Commands.SET_TERMS, v);
    return {
      type: 'LAUNCHER/TERMS',
      version: v
    };
  };
}

export function connecting (value: boolean): ISetConnectingAction {
  return {
    type: ActionTypes.SET_CONNECTING,
    payload: value
  };
}

function setConfigAction (config: any): IConfigAction {
  return {
    type: ActionTypes.CONFIG,
    payload: config
  };
}

export function readConfig (): any {
  return async (dispatch: any) => {
    const config = await ipcRenderer.invoke(Commands.GET_APP_SETTINGS);
    log.debug(`Got app settings from electron: ${JSON.stringify(config)}`);
    dispatch(setConfigAction(config));
  };

  // if (typeof window.process !== 'undefined') {
  //
  //   const launcherConfig = remote.getGlobal('launcherConfig').get();
  //
  //   log.debug(`Got launcher config from electron: ${JSON.stringify(launcherConfig)}`);
  //
  //   return {
  //     type: ActionTypes.CONFIG,
  //     payload: launcherConfig
  //   };
  // }
  // return {
  //   type: ActionTypes.CONFIG,
  //   payload: {}
  // };
}
