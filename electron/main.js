import {app, BrowserWindow} from 'electron';
import { createWindow, mainWindow } from './mainWindow';
import { RpcApi } from '../src/lib/rpcApi';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// This instance will be called from renderer process through remote.getGlobal("rpc")
// In the future it is possible to replace rpc implementation
global.rpc = new RpcApi();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow(isDev);
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow(isDev)
  }
})
