require('babel-polyfill'); // eslint-disable-line import/no-unresolved
require('regenerator-runtime/runtime');
const gitversion = require('../gitversion.json');
const {
  ServerConnect,
  EmeraldApiAccessLocal,
  EmeraldApiAccessDev,
  EmeraldApiAccessProd,
} = require('@emeraldwallet/services');
const {
  getMainWindow, protocol, assertSingletonWindow, Application, Settings, LocalConnector, LocalWalletState
} = require('@emeraldwallet/electron-app');
const { app, ipcMain, session } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path'); // eslint-disable-line
const { LedgerApi } = require('@emeraldwallet/ledger');
const log = require('./logger');
const { startProtocolHandler } = protocol;
const {
  DevMode, LocalMode, ProdMode, sendMode,
} = require('./mode');
const { onceReady } = require('./ready');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

let apiMode;

let dataDir = null;

if (isDev) {
  log.warn('START IN DEVELOPMENT MODE');
  const appArgs = process.argv.slice(2);
  const notLocal = appArgs.every((value) => value !== '--localMode');
  dataDir = notLocal ? './.emerald-dev' : './.emerald-dev-local';
  app.setPath('userData', path.resolve(path.join(dataDir, '/userData')));
  apiMode = notLocal ? DevMode : LocalMode;
} else {
  log.warn('START IN PRODUCTION MODE');
  apiMode = ProdMode;
}

const settings = new Settings();

global.ledger = new LedgerApi();

log.info('userData: ', app.getPath('userData'));
log.info('Settings: ', settings.toJS());
log.info('Api Mode: ', apiMode.id);

const options = {
  aboutWndPath: path.join(__dirname, '../app/about.html'),
  mainWndPath: path.join(__dirname, '../app/index.html'),
  appIconPath: path.join(__dirname, '../app/icons/512x512.png'),
  openDevTools: isDev,
  logFile: log.transports.file.file,
};

assertSingletonWindow();
startProtocolHandler();

const appParams = {
  locale: app.getLocale(),
  version: app.getVersion(),
  gitVersion: gitversion,
  electronVer: process.versions.electron,
  chromeVer: process.versions.chrome,
};

const application = new Application(settings, appParams);

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info('Starting Emerald', app.getVersion());
  log.info('... setup API access');
  let apiAccess;
  if (apiMode.id === ProdMode.id) {
    apiAccess = new EmeraldApiAccessProd(settings.getId(), appParams);
  } else if (apiMode.id === LocalMode.id) {
    apiAccess = new EmeraldApiAccessLocal(settings.getId(), appParams);
  } else {
    apiAccess = new EmeraldApiAccessDev(settings.getId(), appParams);
  }
  log.info('Connect to', apiAccess.address);

  log.info('... Setup Vault');
  const vault = new LocalConnector(dataDir ? path.resolve(path.join(dataDir, '/vault')) : null);
  global.vault = vault.getProvider();

  log.info('... Setup ServerConnect');
  const serverConnect = new ServerConnect(appParams.version, appParams.locale, log, apiAccess.blockchainClient);
  global.serverConnect = serverConnect;

  serverConnect.init(process.versions);

  log.info('... Creating RPC connections to blockchains');
  const rpcConns = serverConnect.connectTo(apiMode.chains);

  log.info('... Create main window');
  const browserWindow = getMainWindow(application, options);

  log.info('... Run Application');
  const walletState = new LocalWalletState(vault.getProvider());
  application.run(browserWindow.webContents, apiAccess, apiMode, vault.getProvider(), rpcConns, walletState);

  onceReady(() => {
    let webContents = getMainWindow(application, options).webContents;
    if (webContents != null) {
      try {
        sendMode(webContents, apiMode);
      } catch (e) {
        log.warn("Cannot send to the UI", e)
      }
    }
  });


  app.on('quit', () => {
    application.stop();
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
  getMainWindow(application, options);
  // make sure it's still connected to remote (may lose after some time, 15+ minutes)
  application.reconnect();
});

app.addListener("", () => {
})
