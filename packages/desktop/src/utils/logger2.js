const log = require('electron-log');

export default class ElectronLogger {
  debug (...params) {
    log.debug(...params);
  }

  error (...params) {
    log.error(...params);
  }

  info (...params) {
    log.info(...params);
  }

  warn (...params) {
    log.warn(...params);
  }
}
