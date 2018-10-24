const ipcMain = require('electron').ipcMain; // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');

module.exports = (services) => {
  ipcMain.on('get-status', (event) => {
    event.returnValue = 'ok';
    services.notifyStatus();
  });

  ipcMain.on('get-version', (event) => {
    event.sender.send('get-version-result', {
      geth: services.setup.geth.clientVersion,
      connector: services.setup.connector.version,
    });
  });
};
