const { app, ipcMain } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path');

const Settings = require('./settings');
const mainWindow = require('./mainWindow');
const Services = require('./services').Services;
const LedgerApi = require('./ledger').LedgerApi;
const ipc = require('./ipc');
const log = require('./logger');
const { startProtocolHandler } = require('./protocol');
const assertSingletonWindow = require('./singletonWindow');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const settings = new Settings();

global.ledger = new LedgerApi();
global.launcherConfig = {
  get: () => settings.toJS(),
};

log.info('userData: ', app.getPath('userData'));
log.info(`Chain: ${JSON.stringify(settings.getChain())}`);
log.info('Settings: ', settings.toJS());

assertSingletonWindow();
startProtocolHandler();

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info('Starting Emerald...');
  const browserWindow = mainWindow.createWindow(isDev);

  const services = new Services(browserWindow.webContents);
  ipc({ settings, services });
  app.on('quit', () => services.shutdown());

  services.useSettings(settings.toJS())
    .then(() => services.start())
    .then(() => ipc({ settings, services }));
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
