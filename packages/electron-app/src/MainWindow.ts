import { BrowserWindow, Menu, shell } from 'electron';
import { createAboutPage } from './AboutWindow';
import darwinMenu from './menus/darwin';
import winLinuxMenu from './menus/win-linux';

const url = require('url');
const devtron = require('devtron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;
let menu;

export function getMainWindow (options: any) {
  if (mainWindow) {
    return mainWindow;
  }
  createWindow(options);
  return mainWindow;
}

const createWindow = function (options: any): BrowserWindow {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 650,
    minWidth: 1200,
    minHeight: 650,
    icon: options.appIconPath
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: options.mainWndPath,
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  if (options.openDevTools) {
    mainWindow.webContents.openDevTools();
    devtron.install();
  }

  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  const menuHandlers = {
    onAbout: () => {
      createAboutPage(options);
    },
    onOpenLog: () => {
      shell.openItem(options.logFile);
    }
  };

  // Menu
  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate(darwinMenu(mainWindow, menuHandlers));
  } else {
    menu = Menu.buildFromTemplate(winLinuxMenu(mainWindow, menuHandlers));
  }
  Menu.setApplicationMenu(menu);
  mainWindow.setMenu(menu);

  return mainWindow;
};
