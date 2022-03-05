import { Settings } from '@emeraldwallet/electron-app';
import { app } from 'electron';
import * as logger from 'electron-log';
import { resolve as resolvePath } from 'path';
import { DevelopmentMode, ProductionMode } from './api-modes';

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

app.on('ready', () => {});
