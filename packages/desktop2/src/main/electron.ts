import { getMainWindow } from '@emeraldwallet/electron-app';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(app.getAppPath(), 'icons/512x512.png'),
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
}

app.on('ready', () => {

  createWindow();

  // const browserWindow: BrowserWindow = getMainWindow({
  //   appIconPath,
  //   mainWndPath
  // });
});
