const ipcMain = require('electron').ipcMain; // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');

module.exports = (services) => {
  ipcMain.on('get-status', (event) => {
    event.returnValue = 'ok';
    log.debug('on get-status');
    services.notifyStatus();
  });
};
