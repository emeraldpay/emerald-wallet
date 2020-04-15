import { getMainWindow } from '@emeraldwallet/electron-app';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

const options = {
  appIconPath: path.join(app.getAppPath(), 'icons/512x512.png'),
  mainWndPath: path.join(app.getAppPath(), 'index.html')
};

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: options.appIconPath,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
}

app.on('ready', () => {

  // createWindow();
  //
  const browserWindow: BrowserWindow = getMainWindow(options);
});
