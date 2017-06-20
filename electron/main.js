import {app, BrowserWindow, ipcMain } from 'electron';
import { createWindow, mainWindow } from './mainWindow';
import { RpcApi } from '../src/lib/rpcApi';
import { launchGeth, launchEmerald } from './launcher';
import { Services } from './services';
import log from 'loglevel';
import Store from 'electron-store';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

log.setLevel(isDev ? log.levels.DEBUG : log.levels.INFO);

// This instance will be called from renderer process through remote.getGlobal("rpc")
// In the future it is possible to replace rpc implementation
global.rpc = new RpcApi();

const store = new Store({
    defaults: {
        firstRun: true,
    },
    name: 'launcher'
});

global.launcherConfig = {
    firstRun: store.get('firstRun'),
    chain: store.get('chain')
};

console.log('firstRun', store.get('firstRun'));
console.log('userData: ', app.getPath('userData'));

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    log.info("Starting Emerald...");
    const webContents = createWindow(isDev);

    const services = new Services(webContents);
    services.start();
    ipcMain.on('get-status', (event) => {
        event.returnValue = "ok";
        services.notifyStatus();
    })
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow(isDev)
  }
});
