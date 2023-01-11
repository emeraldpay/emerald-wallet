import { join as joinPath, resolve as resolvePath } from 'path';
import { initialize as initRemote, enable as remoteEnable } from '@electron/remote/main';
import { IpcCommands } from '@emeraldwallet/core';
import {
  Application,
  MainWindowOptions,
  Settings,
  VaultManager,
  assertSingletonWindow,
  getMainWindow,
  startProtocolHandler,
} from '@emeraldwallet/electron-app';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { EmeraldApiAccess, EmeraldApiAccessDev, EmeraldApiAccessProd, ServerConnect } from '@emeraldwallet/services';
import { app, ipcMain } from 'electron';
import * as logger from 'electron-log';
import { DevelopmentMode, ProductionMode } from './utils/api-modes';
import gitVersion from '../../gitversion.json';

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

  app.setPath('userData', resolvePath(dataDir, 'data'));
} else {
  logger.debug('Start in production mode');
}

app.on('ready', () => {
  const settings = new Settings();

  logger.info('Api Mode:', apiMode.id);
  logger.info('Settings:', settings.toJSON());
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

  const persistentStateDir = dataDir == null ? null : resolvePath(joinPath(dataDir, 'state'));

  logger.info(`Setup Persistent State in ${persistentStateDir ?? 'default directory'}`);

  const persistentState = new PersistentStateManager(persistentStateDir);

  const vaultDir = dataDir == null ? null : resolvePath(joinPath(dataDir, 'vault'));

  logger.info(`Setup Vault in ${vaultDir ?? 'default directory'}`);

  const vault = new VaultManager(vaultDir);

  logger.info('Setup Server connect');

  const serverConnect = new ServerConnect(parameters.version, parameters.locale, logger, apiAccess.blockchainClient);

  serverConnect.init(process.versions);

  logger.info('Creating RPC connections to blockchains');

  const rpcConnections = serverConnect.connectTo(apiMode.chains);

  logger.info('Create main window');

  const { webContents } = getMainWindow(application, vault, logger, options);

  remoteEnable(webContents);

  logger.info('Run application');

  application.run(webContents, apiAccess, apiMode, persistentState, vault, rpcConnections);

  let initialized = false;
  let reloaded = false;

  if (isDevelopMode) {
    webContents.on('did-start-loading', () => {
      if (initialized) {
        reloaded = true;
      }
    });
  }

  ipcMain.on(IpcCommands.EMERALD_READY, () => {
    logger.info('Emerald app launched');

    const { webContents } = getMainWindow(application, vault, logger, options);

    if (webContents != null) {
      webContents.send(IpcCommands.STORE_DISPATCH, { type: 'SETTINGS/SET_MODE', payload: apiMode });

      if (initialized) {
        application.reconnect(reloaded);
      }
    }

    initialized = true;
  });

  app.on('activate', () => {
    getMainWindow(application, vault, logger, options);

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
