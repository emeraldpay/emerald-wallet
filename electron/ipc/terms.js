const ipcMain = require('electron').ipcMain; // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');

module.exports = function (settings) {
  ipcMain.on('terms', (event, v) => {
    settings.setTerms(v);
    event.returnValue = 'ok';
  });
};
