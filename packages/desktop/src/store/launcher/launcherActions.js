import { Logger } from '@emeraldwallet/core';

const log = Logger.forCategory('launcherActions');

export function readConfig() {
  if (typeof window.process !== 'undefined') {
    const { remote } = global.require('electron');
    const launcherConfig = remote.getGlobal('launcherConfig').get();

    log.debug(`Got launcher config from electron: ${JSON.stringify(launcherConfig)}`);

    return {
      type: 'LAUNCHER/CONFIG',
      config: launcherConfig,
      launcherType: 'electron',
    };
  }
  return {
    type: 'LAUNCHER/CONFIG',
    config: {},
    launcherType: 'browser',
  };
}

// TODO: Depricated
// export function agreeOnTerms(v) {
//   ipcRenderer.send('terms', v);
//   return {
//     type: 'LAUNCHER/TERMS',
//     version: v,
//   };
// }

// TODO: Depricated
// export function saveSettings(extraSettings) {
//   extraSettings = extraSettings || {};
//   return (dispatch, getState) => {
//     const geth = getState().launcher.get('geth').toJS();
//     const chain = getState().launcher.get('chain').toJS();
//
//     const settings = { geth, chain, ...extraSettings };
//
//     log.info('Save settings', settings);
//
//     ipcRenderer.send('settings', settings);
//
//     dispatch({
//       type: 'LAUNCHER/SETTINGS',
//       updated: false,
//     });
//   };
// }

export function connecting(value) {
  return {
    type: 'LAUNCHER/CONNECTING',
    value,
  };
}
