import { BrowserWindow, Menu, shell } from 'electron';
import Application from '../application/Application';
import darwinMenu from '../menus/darwin';
import winLinuxMenu from '../menus/win-linux';
import { createAboutPage } from './AboutWindow';

const url = require('url');
const devtron = require('devtron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;
let menu;

const createWindow = (app: Application, options: any): BrowserWindow => {
  // Create the browser window.
  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 650,
    minWidth: 1200,
    minHeight: 650,
    icon: options.appIconPath,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: options.mainWndPath,
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  if (options.openDevTools) {
    win.webContents.openDevTools();
    devtron.install();
  }

  const menuHandlers = {
    onAbout: () => {
      app.showAbout();
      // createAboutPage(options);
    },
    onOpenLog: () => {
      shell.openItem(options.logFile);
    }
  };

  // Menu
  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate(darwinMenu(win, menuHandlers));
  } else {
    menu = Menu.buildFromTemplate(winLinuxMenu(win, menuHandlers));
  }
  Menu.setApplicationMenu(menu);
  win.setMenu(menu);
  return win;
};

export function getMainWindow (app: Application, options: any): BrowserWindow {
  if (mainWindow) {
    return mainWindow;
  }
  mainWindow = createWindow(app, options);
  app.setWebContents(mainWindow.webContents);
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  })
  return mainWindow;
}
