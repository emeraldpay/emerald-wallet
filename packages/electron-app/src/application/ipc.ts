import { Commands } from '@emeraldwallet/core';
import { ipcMain } from 'electron';
import Application from './Application';
const os = require('os');

export function setIpcHandlers (app: Application) {

  ipcMain.handle(Commands.GET_VERSION, async (event, args) => {
    const osDetails = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    };
    return {
      os: osDetails
    };
  });

  ipcMain.handle(Commands.GET_APP_SETTINGS, () => {
    return app.settings.toJS();
  });
}
