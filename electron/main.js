import {app, BrowserWindow} from 'electron';
import { createWindow, mainWindow } from './mainWindow';
import { RpcApi } from '../src/lib/rpcApi';
import { launchGeth, launchEmerald } from './launcher';
import { newGethDownloader } from './downloader';
import log from 'loglevel';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

log.setLevel(isDev ? log.levels.DEBUG : log.levels.INFO);

// This instance will be called from renderer process through remote.getGlobal("rpc")
// In the future it is possible to replace rpc implementation
global.rpc = new RpcApi();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    log.info("Starting Emerald...");
    let gethDownloader = newGethDownloader();
    gethDownloader.downloadIfNotExists().then(() => {
        let geth = launchGeth();
        geth.stdout.on('data', (data) => {
            // console.log('geth stdout: ' + data);
        });
        geth.stderr.on('data', (data) => {
            // console.log('geth stderr: ' + data);
            if (/HTTP endpoint opened/.test(data)) {
                log.info('Geth RPC API is ready');
                createWindow(isDev);
            }
        });
        geth.on('exit', (code) => {
            console.log('geth process exited with code ' + code);
        });
    }).catch((err) => {
        log.error("Unable to download Geth", err);
    });
    
    let emerald = launchEmerald();
    emerald.on('exit', (code) => {
        console.log('emerald process exited with code ' + code);
    });
    emerald.stderr.on('data', (data) => {
        // console.log('emerald stderr: ' + data);
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
