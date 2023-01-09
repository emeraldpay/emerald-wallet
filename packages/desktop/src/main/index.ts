import { join as joinPath, resolve as resolvePath } from 'path';
import { initialize as initRemote, enable as remoteEnable } from '@electron/remote/main';
import {
  Application,
  LocalConnector,
  MainWindowOptions,
  Settings,
  assertSingletonWindow,
  getMainWindow,
  protocol,
} from '@emeraldwallet/electron-app';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { EmeraldApiAccess, EmeraldApiAccessDev, EmeraldApiAccessProd, ServerConnect } from '@emeraldwallet/services';
import { app, ipcMain } from 'electron';
import * as logger from 'electron-log';
import { DevelopmentMode, ProductionMode, sendMode } from './utils/api-modes';
import gitVersion from '../../gitversion.json';

const { startProtocolHandler } = protocol;

const isDevelopMode = process.env.NODE_ENV === 'development';

logger.transports.file.level = isDevelopMode ? 'silly' : 'debug';
logger.transports.console.level = isDevelopMode ? 'debug' : 'info';

process.on('uncaughtException', (error) => logger.error('Uncaught exception:', error));
process.on('unhandledRejection ', (error) => logger.error('Uncaught promise rejection:', error));

assertSingletonWindow();
startProtocolHandler();

initRemote();

let apiMode = ProductionMode;
let dataDir: string | null = null;

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

  const options: MainWindowOptions = {
    isDevelopMode,
    aboutWndPath: resolvePath(__dirname, '../renderer/about.html'),
    appIconPath: resolvePath(__dirname, '../../resources/icon.png'),
    mainWndPath: resolvePath(__dirname, '../renderer/index.html'),
    logFile: logger.transports.file.getFile().path,
  };

  const application = new Application(settings, parameters);

  logger.info('Starting Emerald', app.getVersion());
  logger.info('Setup API access');

  let apiAccess: EmeraldApiAccess;

  if (apiMode.id === DevelopmentMode.id) {
    apiAccess = new EmeraldApiAccessDev(settings.getId(), parameters);
  } else {
    apiAccess = new EmeraldApiAccessProd(settings.getId(), parameters);
  }

  logger.info('Connect to', apiAccess.address);
  logger.info('Setup Vault');

  const vault = new LocalConnector(dataDir == null ? null : resolvePath(joinPath(dataDir, 'vault')));

  const vaultProvider = vault.getProvider();

  logger.info('Setup Server connect');

  const serverConnect = new ServerConnect(parameters.version, parameters.locale, logger, apiAccess.blockchainClient);

  serverConnect.init(process.versions);

  logger.info('Creating RPC connections to blockchains');

  const rpcConnections = serverConnect.connectTo(apiMode.chains);

  logger.info('Create main window');

  const { webContents } = getMainWindow(application, vaultProvider, logger, options);

  remoteEnable(webContents);

  logger.info('Run application');

  const persistentState = new PersistentStateImpl(
    dataDir == null ? null : resolvePath(joinPath(dataDir, 'persistentState')),
  );

  application.run(webContents, apiAccess, apiMode, persistentState, vaultProvider, rpcConnections);

  let initialized = false;

  ipcMain.on('emerald-ready', () => {
    logger.info('Emerald app launched');

    const { webContents } = getMainWindow(application, vaultProvider, logger, options);

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
    getMainWindow(application, vaultProvider, logger, options);

    application.reconnect();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('quit', () => {
    persistentState.close();
    application.stop();
  });
});
