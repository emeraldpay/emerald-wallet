import {app, BrowserWindow, ipcMain } from 'electron';
import { createWindow, mainWindow } from './mainWindow';
import { RpcApi } from '../src/lib/rpcApi';
import { launchGeth, launchEmerald } from './launcher';
import { newGethDownloader } from './downloader';
import { UserNotify } from './userNotify';
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

    let emeraldLaunched = false;
    let gethLaunched = false;

    const webContents = createWindow(isDev);
    const notify = new UserNotify(webContents);

    notify.status("geth", "not ready");
    let gethDownloader = newGethDownloader(notify);
    gethDownloader.downloadIfNotExists().then(() => {
        notify.info("Launching Geth backend");
        let geth = launchGeth();
        geth.stdout.on('data', (data) => {
            // console.log('geth stdout: ' + data);
        });
        geth.stderr.on('data', (data) => {
            // console.log('geth stderr: ' + data);
            if (/HTTP endpoint opened/.test(data)) {
                gethLaunched = true;
                notify.info("Geth RPC API is ready");
                store.set('firstRun', false);
                notify.status("geth", "ready");
            }
        });
        geth.on('exit', (code) => {
            console.log('geth process exited with code ' + code);
        });
    }).catch((err) => {
        log.error("Unable to download Geth", err);
        notify.info(`Unable to download Geth: ${err}`);
    });

    notify.status("connector", "not ready");
    let emerald = launchEmerald();
    emerald.on('exit', (code) => {
        console.log('emerald process exited with code ' + code);
    });
    emerald.stderr.on('data', (data) => {
        if (!emeraldLaunched) {
            notify.status("connector", "ready");
            emeraldLaunched = true;
        }
        console.log('emerald stderr: ' + data);
    });
    ipcMain.on('get-status', (event) => {
        event.returnValue = "ok";
        notify.status("connector", emeraldLaunched ? "ready" : "not ready");
        notify.status("geth", gethLaunched ? "ready" : "not ready");
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
