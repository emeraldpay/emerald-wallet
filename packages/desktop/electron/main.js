require('babel-polyfill'); // eslint-disable-line import/no-unresolved
require('regenerator-runtime/runtime');
const { ServerConnect } = require('@emeraldwallet/services');
const { app, ipcMain, session } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path'); // eslint-disable-line

const Settings = require('./settings');
const mainWindow = require('./mainWindow');
const { Services } = require('./services');
const { LedgerApi } = require('./ledger');
const ipc = require('./ipc');
const log = require('./logger');
const { startProtocolHandler } = require('./protocol');
const assertSingletonWindow = require('./singletonWindow');
const { URL_FOR_CHAIN } = require('./utils');
const { Prices } = require('./prices');
const { BalanceIpc } = require('./ipc/balance');
const { TransactionIpc } = require('./ipc/transactions');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

if (isDev) {
  log.warn('START IN DEVELOPMENT MODE');
  app.setPath('userData', path.resolve('./.emerald-dev/userData'));
}

const settings = new Settings();

global.ledger = new LedgerApi();
global.launcherConfig = {
  get: () => settings.toJS(),
};
const serverConnect = new ServerConnect(URL_FOR_CHAIN, app.getVersion(), app.getLocale(), log);
global.serverConnect = serverConnect;

log.info('userData: ', app.getPath('userData'));
log.info(`Chain: ${JSON.stringify(settings.getChain())}`);
log.info('Settings: ', settings.toJS());

assertSingletonWindow();
startProtocolHandler();

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info('Starting Emerald', app.getVersion());

  serverConnect.init(process.versions);

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = serverConnect.getUserAgent();
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });


  const browserWindow = mainWindow.createWindow(isDev);
  const services = new Services(browserWindow.webContents, serverConnect);
  ipc({ settings, services });
  app.on('quit', () => services.shutdown());

  services.useSettings(settings.toJS())
    .then(() => services.start())
    .then(() => ipc({ settings, services }))
    .catch((err) => log.error('Invalid settings', err));

  const prices = new Prices(browserWindow.webContents, isDev);
  prices.start();

  const balanceIpc = new BalanceIpc(browserWindow.webContents);
  balanceIpc.start(settings.getChain().name);

  const transactionIpc = new TransactionIpc(browserWindow.webContents);
  transactionIpc.start(settings.getChain().name);
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
