const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');

module.exports = (services) => {
  ipcMain.on('get-status', (event) => {
    event.returnValue = 'ok';
    services.notifyStatus();
  });

  ipcMain.on('get-version', (event) => {
    event.sender.send('get-version-result', {
      connector: services.setup.connector.version,
    });
  });
};
