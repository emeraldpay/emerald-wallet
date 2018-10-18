const electron = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const winLinuxMenu = require('./menus/win-linux');
const darwinMenu = require('./menus/darwin');
const path = require('path');
const url = require('url');
const devtron = require('devtron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let menu;

const createWindow = function (openDevTools) {
  // Create the browser window.
  mainWindow = new electron.BrowserWindow({ width: 1200, height: 650, minWidth: 1200, minHeight: 650 });

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

  return mainWindow;
};

module.exports = {
  mainWindow,
  createWindow,
};
