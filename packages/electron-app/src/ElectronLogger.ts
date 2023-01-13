import process from 'process';
import { ILogger } from '@emeraldwallet/core';
import log from 'electron-log';

const isDevelopment = process.env.NODE_ENV === 'development';

log.transports.file.level = isDevelopment ? 'silly' : 'debug';
log.transports.console.level = isDevelopment ? 'debug' : 'info';

export class ElectronLogger implements ILogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...params: any[]): void {
    log.debug(...params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...params: any[]): void {
    log.info(...params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...params: any[]): void {
    log.warn(...params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...params: any[]): void {
    log.error(...params);
  }
}
