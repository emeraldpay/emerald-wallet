const electron = require('electron');
const app = electron.app;
const log = require('electron-log');
const Store = require('electron-store');
const mainWindow = require('./mainWindow');
const Services = require('./services').Services;
const LedgerApi = require('./ledger').LedgerApi;
const ipc = require('./ipc');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// electron-log
//
// By default it writes logs to the following locations:
//
// on Linux: ~/.config/<app name>/log.log
// on OS X: ~/Library/Logs/<app name>/log.log
// on Windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
log.transports.file.level = isDev ? 'silly' : 'debug';
log.transports.console.level = isDev ? 'debug' : 'info';

const settings = new Store({
    name: 'settings',
    defaults: {
        geth: {
            type: 'none',
            url: '',
        },
        chain: {
            name: null,
            id: null,
        },
        terms: 'none',
    },
});

global.ledger = new LedgerApi();
global.launcherConfig = {
    get() { return settings.store; },
};

log.info('userData: ', app.getPath('userData'));
log.info(`Chain: ${JSON.stringify(settings.get('chain'))}`);
log.info('Settings: ', settings.store);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    log.info('Starting Emerald...');
    const webContents = mainWindow.createWindow(isDev);

    const services = new Services(webContents);
    services.useSettings(settings);
    services.start().catch((err) => log.error('Failed to start Services', err));

    ipc({ settings, services });

    app.on('quit', () => {
        return services.shutdown()
            .then(() => log.info('All services are stopped'))
            .catch((e) => log.error('Failed to stop services', e));
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow.mainWindow === null) {
        mainWindow.createWindow(isDev);
    }
});
