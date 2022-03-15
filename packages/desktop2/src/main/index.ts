import {
  Application,
  assertSingletonWindow,
  getMainWindow,
  LocalConnector,
  LocalWalletState,
  protocol,
  Settings,
} from '@emeraldwallet/electron-app';
import { EmeraldApiAccessDev, EmeraldApiAccessProd, ServerConnect } from '@emeraldwallet/services';
import { app, ipcMain } from 'electron';
import * as logger from 'electron-log';
import path, { resolve as resolvePath } from 'path';
import gitVersion from '../../gitversion.json';
import { DevelopmentMode, ProductionMode, sendMode } from './helpers/api-modes';

const { startProtocolHandler } = protocol;

assertSingletonWindow();
startProtocolHandler();

const isDevelopMode = process.env.NODE_ENV === 'development';

logger.transports.file.level = isDevelopMode ? 'silly' : 'debug';
logger.transports.console.level = isDevelopMode ? 'debug' : 'info';

let apiMode = ProductionMode;
let dataDir: string = null;

if (isDevelopMode) {
  logger.debug('Start in development mode');

  apiMode = DevelopmentMode;
  dataDir = resolvePath('./.emerald-dev');

  app.setPath('userData', resolvePath(dataDir, 'userData'));
} else {
  logger.debug('Start in production mode');
}

const settings = new Settings();

logger.info('Api Mode:', apiMode.id);
logger.info('Settings:', settings.toJS());
logger.info('User data:', app.getPath('userData'));

const parameters = {
  locale: app.getLocale(),
  version: app.getVersion(),
  gitVersion,
  electronVer: process.versions.electron,
  chromeVer: process.versions.chrome,
};

const options = {
  aboutWndPath: resolvePath(__dirname, '../renderer/about.html'),
  appIconPath: resolvePath(__dirname, '../../resources/icon.png'),
  mainWndPath: resolvePath(__dirname, '../renderer/index.html'),
  logFile: logger.transports.file.getFile().path,
  openDevTools: isDevelopMode,
};

const application = new Application(settings, parameters);

app.on('ready', () => {
  logger.info('Starting Emerald', app.getVersion());
  logger.info('Setup API access');

  let apiAccess;

  if (apiMode.id === DevelopmentMode.id) {
    apiAccess = new EmeraldApiAccessDev(settings.getId(), parameters);
  } else {
    apiAccess = new EmeraldApiAccessProd(settings.getId(), parameters);
  }

  logger.info('Connect to', apiAccess.address);
  logger.info('Setup Vault');

  const vault = new LocalConnector(dataDir ? resolvePath(path.join(dataDir, '/vault')) : null);

  logger.info('Setup Server connect');

  const serverConnect = new ServerConnect(parameters.version, parameters.locale, logger, apiAccess.blockchainClient);

  serverConnect.init(process.versions);

  logger.info('Creating RPC connections to blockchains');

  const rpcConnections = serverConnect.connectTo(apiMode.chains);

  logger.info('Create main window');

  const browserWindow = getMainWindow(application, options);

  logger.info('Run application');

  const walletState = new LocalWalletState(vault.getProvider());

  application.run(browserWindow.webContents, apiAccess, apiMode, vault.getProvider(), rpcConnections, walletState);

  ipcMain.on('emerald-ready', () => {
    logger.info('Emerald app launched');

    const webContents = getMainWindow(application, options).webContents;

    if (webContents != null) {
      try {
        sendMode(webContents, apiMode);
      } catch (exception) {
        logger.warn('Cannot send to the UI', exception);
      }
    }
  });

  app.on('quit', () => {
    application.stop();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  getMainWindow(application, options);

  application.reconnect();
});
