const electron = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const winLinuxMenu = require('./menus/win-linux');
const darwinMenu = require('./menus/darwin');
const path = require('path');
const url = require('url');
const devtron = require('devtron');
const protocol = require('electron').protocol; // eslint-disable-line import/no-extraneous-dependencies
const log = require('./logger');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let menu;

// prints given message both in the terminal console and in the DevTools
function devToolsLog(s) {
  console.log(s)
}

const createWindow = function (openDevTools) {
  // Create the browser window.
  mainWindow = new electron.BrowserWindow({ width: 1200, height: 650, minWidth: 1200, minHeight: 650 });

  protocol.registerStringProtocol('ethereum', (request, callback) => {
    ////didnt freeze
    devToolsLog(`ETHEREUM HTTP PROTOCOL CALLED: ${JSON.stringify(request)}`);

    mainWindow.webContents.send('protocol', request);
    callback('foobar');
  }, (err) => {
    log.info('hit error handler');
    devToolsLog("SHIT IS BUSTEDDDD");
    devToolsLog(err);
    if (err) {
      return console.error(err);
    }
    log.info('REGISTERED PROTOCLOL');
    console.log('Registered protocol succesfully');
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../app/index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  if (openDevTools) {
    mainWindow.webContents.openDevTools();
    devtron.install();
  }

  /* mainWindow.webContents.on('will-navigate', (e, _url) => {
   *   e.preventDefault();
   *   electron.shell.openExternal(_url);
   * });*/

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Menu
  if (process.platform === 'darwin') {
    menu = electron.Menu.buildFromTemplate(darwinMenu(mainWindow));
  } else {
    menu = electron.Menu.buildFromTemplate(winLinuxMenu(mainWindow));
  }
  electron.Menu.setApplicationMenu(menu);
  mainWindow.setMenu(menu);

  return mainWindow.webContents;
};


module.exports = {
  mainWindow,
  createWindow,
};

