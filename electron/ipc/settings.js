const ipcMain = require('electron').ipcMain;
const log = require('electron-log');

module.exports = function (settings, services) {
    ipcMain.on('settings', (event, newSettings) => {
        event.returnValue = 'ok';

        log.info('Update settings', newSettings);

        if (newSettings.geth) {
            settings.set('geth', newSettings.geth);
        }

        if (newSettings.chain) {
            const chain = newSettings.chain;

            if (['mainnet', 'testnet', 'morden'].indexOf(chain.name) < 0) {
                log.error(`Unknown chain: ${JSON.stringify(chain)}`);
                event.returnValue = 'fail';
                return;
            }
            settings.set('chain', chain);
        }


        // Restart services with new settings
        services.shutdown()
            .then(services.notifyStatus.bind(services))
            .then(() => services.useSettings(settings))
            .then(services.start.bind(services))
            .then(services.notifyStatus.bind(services))
            .catch((err) => log.error('Failed to restart after changing settings', err));
    });
};
