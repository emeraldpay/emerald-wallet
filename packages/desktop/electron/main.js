require('babel-polyfill'); // eslint-disable-line import/no-unresolved
require('regenerator-runtime/runtime');
const { ServerConnect, EmeraldApiAccessDev} = require('@emeraldwallet/services');
const { app, ipcMain, session } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path'); // eslint-disable-line

const Settings = require('./settings');
const mainWindow = require('./mainWindow');
const { Services } = require('./services');
const { createServices2 } = require('./services2');
const { LedgerApi } = require('./ledger');
const ipc = require('./ipc');
const log = require('./logger');
const { startProtocolHandler } = require('./protocol');
const assertSingletonWindow = require('./singletonWindow');
const { URL_FOR_CHAIN } = require('./utils');
const { Prices } = require('./prices');
const {
  DevMode, LocalMode, ProdMode, sendMode,
} = require('./mode');
const { onceReady } = require('./ready');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
let mode;


if (isDev) {
  log.warn('START IN DEVELOPMENT MODE');
  app.setPath('userData', path.resolve('./.emerald-dev/userData'));
  mode = LocalMode;
}

const settings = new Settings();

global.ledger = new LedgerApi();
global.launcherConfig = {
  get: () => settings.toJS(),
};

log.info('userData: ', app.getPath('userData'));
log.info('Settings: ', settings.toJS());

assertSingletonWindow();
startProtocolHandler();

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info('Starting Emerald', app.getVersion());

  const apiAccess = new EmeraldApiAccessDev(settings.getId());
  const serverConnect = new ServerConnect(URL_FOR_CHAIN, app.getVersion(), app.getLocale(), log, apiAccess.blockchainClient);
  global.serverConnect = serverConnect;
  serverConnect.init(process.versions);

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = serverConnect.getUserAgent();
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });


  const browserWindow = mainWindow.createWindow(isDev);
  onceReady(() => {
    sendMode(browserWindow.webContents, mode);
  });

  const services = new Services(browserWindow.webContents, serverConnect, apiAccess);
  ipc({ settings, services });

  const services2 = createServices2(ipcMain, browserWindow.webContents, apiAccess);

  app.on('quit', () => {
    services.shutdown();
    services2.stop();
  });

  services.useSettings(settings.toJS())
    .then(() => {
      services.start();
      services2.start();
    })
    .then(() => ipc({ settings, services }))
    .catch((err) => log.error('Invalid settings', err));

  const prices = new Prices(browserWindow.webContents, apiAccess, mode.chains, mode.currencies[0]);
  prices.start();
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
