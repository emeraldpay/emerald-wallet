import { ILogger } from '@emeraldwallet/core';

const log = require('electron-log');
const process = require('process');

const isDev = process.env.NODE_ENV === 'development';

// electron-log
//
// By default it writes logs to the following locations:
//
// on Linux: ~/.config/<app name>/log.log
// on OS X: ~/Library/Logs/<app name>/log.log
// on Windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
log.transports.file.level = isDev ? 'silly' : 'debug';
log.transports.console.level = isDev ? 'debug' : 'info';

export default class ElectronLogger implements ILogger {
  public debug (...params: any[]) {
    log.debug(...params);
  }

  public error (...params: any[]) {
    log.error(...params);
  }

  public info (...params: any[]) {
    log.info(...params);
  }

  public warn (...params: any[]) {
    log.warn(...params);
  }
}
