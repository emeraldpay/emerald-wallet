import { BrowserWindow } from 'electron';

const url = require('url');

export const createAboutPage = (options: any) => {
  const browserWindow = new BrowserWindow({
    width: 700,
    height: 410,
    titleBarStyle: 'hidden',
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: false
  });
  browserWindow.setMenu(null);
  browserWindow.setMenuBarVisibility(false);
  // and load the about.html.
  browserWindow.loadURL(url.format({
    pathname: options.aboutWndPath,
    protocol: 'file:',
    slashes: true
  }));

  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });
};
