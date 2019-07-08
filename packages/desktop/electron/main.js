require('babel-polyfill'); // eslint-disable-line import/no-unresolved
require('regenerator-runtime/runtime');
const { ServerConnect, EmeraldApiAccessLocal, EmeraldApiAccessDev} = require('@emeraldwallet/services');
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
let apiMode;


if (isDev) {
  log.warn('START IN DEVELOPMENT MODE');
  app.setPath('userData', path.resolve('./.emerald-dev/userData'));
  const appArgs = process.argv.slice(2);
  const notLocal = appArgs.every((value) => value !== '--localMode');
  apiMode = notLocal ? DevMode : LocalMode;
}

const settings = new Settings();

global.ledger = new LedgerApi();
global.launcherConfig = {
  get: () => settings.toJS(),
};

log.info('userData: ', app.getPath('userData'));
log.info('Settings: ', settings.toJS());
log.info('Api Mode: ', apiMode.id);

assertSingletonWindow();
startProtocolHandler();

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info('Starting Emerald', app.getVersion());

  log.info('... setup API access');
  let apiAccess;
  if (apiMode === LocalMode) {
    apiAccess = new EmeraldApiAccessLocal(settings.getId());
  } else {
    apiAccess = new EmeraldApiAccessDev(settings.getId());
  }
  log.info('Connect to', apiAccess.address);
  const serverConnect = new ServerConnect(app.getVersion(), app.getLocale(), log, apiAccess.blockchainClient);
  global.serverConnect = serverConnect;
  serverConnect.init(process.versions);

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = serverConnect.getUserAgent();
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });


  log.info('... create window');
  const browserWindow = mainWindow.createWindow(isDev);
  onceReady(() => {
    sendMode(browserWindow.webContents, apiMode);
  });

  const services = new Services(browserWindow.webContents, serverConnect, apiAccess);

  log.info('... setup services 2');
  const services2 = createServices2(ipcMain, browserWindow.webContents, apiAccess, apiMode.chains);

  app.on('quit', () => {
    services.shutdown().catch(console.error);
    services2.stop();
  });

  log.info('... start services');
  services.start()
    .then(() => services2.start())
    .then(() => ipc({ settings, services }))
    .then(() => log.info('... services started'))
    .catch((err) => log.error('Invalid settings', err));

  log.info('... subscribe for prices');
  const prices = new Prices(browserWindow.webContents, apiAccess, apiMode.chains, apiMode.currencies[0]);
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
