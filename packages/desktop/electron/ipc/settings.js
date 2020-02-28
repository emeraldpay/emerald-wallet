const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');

module.exports = (settings) => {
  ipcMain.on('settings', (event, newSettings) => {
    event.returnValue = 'ok';

    log.warn('NOT IMPLEMENTED Update settings', newSettings);

    // TODO
  });
};
