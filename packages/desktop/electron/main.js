require('babel-polyfill'); // eslint-disable-line import/no-unresolved
require('regenerator-runtime/runtime');
const { ServerConnect } = require('@emeraldwallet/services');
const {emeraldCredentials} = require('@emeraldplatform/grpc');
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

const certDevelopment = Buffer.from("-----BEGIN CERTIFICATE-----\n" +
  "MIIFmDCCA4CgAwIBAgIBATANBgkqhkiG9w0BAQsFADBsMQswCQYDVQQGEwJDSDEM\n" +
  "MAoGA1UEBxMDWnVnMRcwFQYDVQQKEw5FbWVyYWxkUGF5IERldjEaMBgGA1UECxMR\n" +
  "RW1lcmFsZFBheSBEZXYgQ0ExGjAYBgNVBAMTEWNhLmVtZXJhbGRwYXkuZGV2MB4X\n" +
  "DTE5MDYwMjAyNDAzNFoXDTIwMTIwMjAyNDAzNFowbDELMAkGA1UEBhMCQ0gxDDAK\n" +
  "BgNVBAcTA1p1ZzEXMBUGA1UEChMORW1lcmFsZFBheSBEZXYxGjAYBgNVBAsTEUVt\n" +
  "ZXJhbGRQYXkgRGV2IENBMRowGAYDVQQDExFjYS5lbWVyYWxkcGF5LmRldjCCAiIw\n" +
  "DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOh9hPlHxpjUt55a5sQieNrcGVhd\n" +
  "ITPvEsDV7rGiar+41sct30d3S5R+whIHQSXAtQu282NDym6RmCE367eTubzYxaOp\n" +
  "BE+iKxYOEFggnXd+JRL7Skhd/xWUyuVUqUXR87fKuxrzVwQpDELugEQ9RVR3+WWr\n" +
  "cQbinbqDte/WyDE1ebw68umAcOZOCQ7D/SzbiVY3mzLn7xgUr0Wdxu2d5lf89B1S\n" +
  "6cXmTCorVtwVNoMcLv5BRgyd4QEgvUINkXqRjdB/C9qU+IgQK9H5He8O5HrBlNkw\n" +
  "v0tLXEhrVk5SFoKLkoeJopy1bNFNUotqKG9XCKI2+l+5L8Ioibxkthm2topAcM2/\n" +
  "/wTKyh6QCrz2rerLckn3xgI4gaTDABZwxXFv+S9wVLv7wnb1yIyFZ+pBMKfvosaZ\n" +
  "UVKY5tMsUiK5AJVlzsiFKaLi1Rwm+fObD/8/zNfjxA5X/MVeLYnj38ykRSXWA4wN\n" +
  "qoGRHlcg7BCw0KJcdV51NVQwcxh9ff1ZPUjjKlmxua/cOotfBOwqV+HLrn51V70F\n" +
  "IjPKwBmMSNt6Qm5ltbu/OdzJOPGyaro8mHMz33Vt2mNveoK9fRzrNixKfwaxHuHk\n" +
  "4RPWZeUd24uZ+2InO84aATSWchIsMIeGlwsf1VghLvqo7xl5UHt4wSgldlX4XYgQ\n" +
  "rH8aWsqXtdhCdGvDAgMBAAGjRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8E\n" +
  "CDAGAQH/AgEAMB0GA1UdDgQWBBSctyWodQE+97ZiTBJf/bEh8LwujzANBgkqhkiG\n" +
  "9w0BAQsFAAOCAgEAv1fHiGVAPIXZ/nGuCNCTcWtaMgI4anz773ma/6F4DbmBxp4R\n" +
  "rHO5YywPaoONWI2DgwUcLgd0GXQf/1YPWEPPvUOFcVSYKIijf5Nv85okWX8PdWv4\n" +
  "ICEVWt9oD6nUJ/VLNFhc34oCMWSYroPag8m45SGGy+o6EI5+c/9WwVzcJqiSfQst\n" +
  "qJ9ZvC1a/8mabJ6d6NsEhHJYC1Wua1XY47VYNUzmXFG+fVhIHpYLK2bQRnm2jTRo\n" +
  "pN6oK2hqIR0Z8/JzyJEMl+bhWChL41GPuqP5iMeM1gux6WBSR3LFzhVJ9trGyvKk\n" +
  "8NOJoF6yxvs9kdSU6ZpogDumJTjwQQCqzkBY3ipQwMmrLFl26yVhTXAz7WWKjvbe\n" +
  "IUh5l/egiWa98UVMAWWJ6TBqSb2r537d633mcfL4xPn16LXBejIdyBUNrIHAKr6h\n" +
  "RzR0ZlfJN+QOxpzd+Jz5aXxQ+VBgpsjZKafiHNgEiICHj9vIR5Z0neND1IZG1qbL\n" +
  "oOk0aiq7BErxKEV7FvmQMHB251xAFkVXIrhv7ObtWqk4n5pS6/NocclwcFqhkjpu\n" +
  "2tq1OLVhNNyRpwjLygMQUt42Ok4j/L+A1uEzNOp17/Yv6gsB6m0eUuBaLN6lKrvF\n" +
  "VKI3QbdAxjkzJ3Zzas9a87SJWrbBgWCeHq0xNECt0RZOX1OfriOofLrmUbI=\n" +
  "-----END CERTIFICATE-----\n", "utf8");

const credentials = emeraldCredentials("127.0.0.1:8090", certDevelopment);

const settings = new Settings();

global.ledger = new LedgerApi();
global.launcherConfig = {
  get: () => settings.toJS(),
};
const serverConnect = new ServerConnect(URL_FOR_CHAIN, app.getVersion(), app.getLocale(), log, credentials);
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
  const services = new Services(browserWindow.webContents, serverConnect, credentials);
  ipc({ settings, services });
  app.on('quit', () => services.shutdown());

  services.useSettings(settings.toJS())
    .then(() => services.start())
    .then(() => ipc({ settings, services }))
    .catch((err) => log.error('Invalid settings', err));

  const prices = new Prices(browserWindow.webContents, credentials);
  prices.start();

  const balanceIpc = new BalanceIpc(browserWindow.webContents, credentials);
  balanceIpc.start(settings.getChain().name);

  const transactionIpc = new TransactionIpc(browserWindow.webContents, credentials);
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
