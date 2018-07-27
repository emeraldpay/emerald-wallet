const app = require('electron').app; // eslint-disable-line import/no-extraneous-dependencies
const protocol = require('electron').protocol; // eslint-disable-line import/no-extraneous-dependencies
const path = require('path');

const Settings = require('./settings');
const mainWindow = require('./mainWindow');
const Services = require('./services').Services;
const LedgerApi = require('./ledger').LedgerApi;
const ipc = require('./ipc');
const log = require('./logger');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';


const settings = new Settings();

global.ledger = new LedgerApi();
global.launcherConfig = {
  get: () => settings.toJS(),
};

log.info('userData: ', app.getPath('userData'));
log.info(`Chain: ${JSON.stringify(settings.getChain())}`);
log.info('Settings: ', settings.toJS());

// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  log.info('Starting Emerald...');
  const webContents = mainWindow.createWindow(isDev);

  const services = new Services(webContents);
  services.useSettings(settings.toJS())
    .then(() => services.start())
    .catch((err) => log.error('Failed to start Services:', err));

  ipc({ settings, services });


  app.on('quit', () => {
    return services.shutdown()
      .then(() => log.info('All services are stopped'))
      .catch((e) => log.error('Failed to stop services:', e));
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
  if (mainWindow.mainWindow === null) {
    mainWindow.createWindow(isDev);
  }
});