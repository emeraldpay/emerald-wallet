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
import { DevelopmentMode, ProductionMode, sendMode } from './utils/api-modes';

const { startProtocolHandler } = protocol;

const isDevelopMode = process.env.NODE_ENV === 'development';

logger.transports.file.level = isDevelopMode ? 'silly' : 'debug';
logger.transports.console.level = isDevelopMode ? 'debug' : 'info';

process.on('uncaughtException', (error) => logger.error('Uncaught exception:', error));
process.on('unhandledRejection ', (error) => logger.error('Uncaught promise rejection:', error));

assertSingletonWindow();
startProtocolHandler();

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

app.on('ready', () => {
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

  const { webContents } = getMainWindow(application, options);

  logger.info('Run application');

  const walletState = new LocalWalletState(vault.getProvider());

  application.run(webContents, apiAccess, apiMode, vault.getProvider(), rpcConnections, walletState);

  let initialized = false;

  ipcMain.on('emerald-ready', () => {
    logger.info('Emerald app launched');

    const { webContents } = getMainWindow(application, options);

    if (webContents != null) {
      try {
        sendMode(webContents, apiMode);

        if (initialized) {
          application.reconnect();
        }
      } catch (exception) {
        logger.warn('Cannot send to the UI', exception);
      }
    }

    initialized = true;
  });

  app.on('activate', () => {
    getMainWindow(application, options);

    application.reconnect();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('quit', () => {
    application.stop();
  });
});
