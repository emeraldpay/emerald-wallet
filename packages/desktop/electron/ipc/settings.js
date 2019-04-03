const { ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const log = require('electron-log');

const { isValidChain } = require('../utils');

module.exports = (settings, services) => {
  ipcMain.on('settings', (event, newSettings) => {
    event.returnValue = 'ok';

    log.info('Update settings', newSettings);

    if (newSettings.chain) {
      const { chain } = newSettings;

      if (!isValidChain(chain)) {
        log.error(`Unknown chain: ${JSON.stringify(chain)}`);
        event.returnValue = 'fail';
        return;
      }

      settings.setChain(chain);
    }

    // Restart services with new settings
    // We do not restart Emerald vault after switching
    services.shutdownRpc()
      .then(() => services.notifyStatus())
      .then(() => services.useSettings(settings.toJS()))
      .then(() => services.start())
      .then(() => services.notifyStatus())
      .catch((err) => log.error('Failed to restart after changing settings', err));
  });
};
