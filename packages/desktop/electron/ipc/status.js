const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const os = require('os'); // eslint-disable-line

module.exports = () => {
  ipcMain.on('get-version', (event) => {
    const osDetails = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
    };
    event.sender.send('get-version-result', {
      os: osDetails,
    });
  });
};
