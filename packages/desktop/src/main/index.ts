import * as os from 'os';
import { join as joinPath, resolve as resolvePath } from 'path';
import { initialize as initRemote, enable as remoteEnable } from '@electron/remote/main';
import { IpcCommands, Versions } from '@emeraldwallet/core';
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
import commitData from '../../commit-data.json';
import { DevelopmentMode, ProductionMode } from './utils/api-modes';

const { NODE_ENV } = process.env;

const isDevelopMode = NODE_ENV === 'debugging' || NODE_ENV === 'development';
const isVerifyMode = NODE_ENV === 'verifying';

logger.transports.file.level = isDevelopMode ? 'silly' : 'debug';
logger.transports.console.level = isDevelopMode ? 'debug' : 'info';

process.on('uncaughtException', (error) => logger.error('Uncaught exception:', error));
process.on('unhandledRejection ', (error) => logger.error('Uncaught promise rejection:', error));

assertSingletonWindow();
startProtocolHandler();

initRemote();

let apiMode = ProductionMode;
let dataDir: string | null = null;

if (isDevelopMode || isVerifyMode) {
  logger.debug(`Start in ${NODE_ENV} mode`);

  if (isVerifyMode || NODE_ENV === 'development') {
    apiMode = DevelopmentMode;
    dataDir = resolvePath('./.emerald-dev');

    app.setPath('userData', resolvePath(dataDir, 'data'));
  }
} else {
  logger.debug('Start in production mode');
}

function settingsJsonReplacer(key: string, value: unknown): unknown {
  return key === 'tokens' && Array.isArray(value) && value.length > 10
    ? value.slice(0, 5).concat(value.slice(-5))
    : value;
}

app.on('ready', () => {
  const settings = new Settings();

  logger.info('Api Mode:', apiMode.id);
  logger.info('Settings:', settings.toJSON(settingsJsonReplacer));
  logger.info('User data:', app.getPath('userData'));

  const versions: Versions = {
    commitData,
    appLocale: app.getLocale(),
    appVersion: app.getVersion(),
    chromeVersion: process.versions.chrome,
    electronVersion: process.versions.electron,
    osVersion: {
      arch: os.arch(),
      platform: os.platform(),
      release: os.release(),
    },
  };

  const options: MainWindowOptions = {
    isDevelopMode,
    aboutWndPath: resolvePath(__dirname, '../renderer/about.html'),
    appIconPath: resolvePath(__dirname, '../../resources/icon.png'),
    mainWndPath: resolvePath(__dirname, '../renderer/index.html'),
    logFile: logger.transports.file.getFile().path,
  };

  const application = new Application(settings, versions);

  logger.info('Starting Emerald', versions.appVersion);
  logger.info('Setup API access');

  let apiAccess: EmeraldApiAccess;

  if (apiMode.id === DevelopmentMode.id) {
    apiAccess = new EmeraldApiAccessDev(settings.getId(), versions);
  } else {
    apiAccess = new EmeraldApiAccessProd(settings.getId(), versions);
  }

  logger.info('Connect to', apiAccess.address);

  const persistentStateDir = dataDir == null ? undefined : resolvePath(joinPath(dataDir, 'state'));

  logger.info(`Setup Persistent State in ${persistentStateDir ?? 'default directory'}`);

  const persistentState = new PersistentStateManager(persistentStateDir);

  const vaultDir = dataDir == null ? undefined : resolvePath(joinPath(dataDir, 'vault'));

  logger.info(`Setup Vault in ${vaultDir ?? 'default directory'}`);

  const vault = new VaultManager(vaultDir);

  logger.info('Setup Server connect');

  const serverConnect = new ServerConnect(versions.appVersion, versions.appLocale, logger, apiAccess.blockchainClient);

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

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('quit', () => {
    persistentState.close();
    application.stop();
  });
});
