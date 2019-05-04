const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');
const os = require('os'); // eslint-disable-line

module.exports = (services) => {
  ipcMain.on('get-status', (event) => {
    event.returnValue = 'ok';
    services.notifyStatus();
  });

  ipcMain.on('get-version', (event) => {
    const osDetails = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
    };
    event.sender.send('get-version-result', {
      connector: services.setup.connector.version,
      os: osDetails,
    });
  });
};
