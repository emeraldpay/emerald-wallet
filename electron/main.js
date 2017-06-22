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

const settings = new Store({
    name: 'settings',
    defaults: {
        // RPC configuration
        chain: {
            //type: 'remote',
            //url: 'https://api.gastracker.io',
            //chain: 'mainnet'
            type: 'local',
            chain: 'morden'
        }
    }
});

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
    services.start().catch((err) => log.error("Failed to start Services", err));
    ipcMain.on('get-status', (event) => {
        event.returnValue = "ok";
        services.notifyStatus();
    });
    ipcMain.on('switch-chain', (event, network, id) => {
        log.info(`Switch chain to ${network} as ${id}`);
        let chain = network.toLowerCase();
        if (['mainnet', 'testnet', 'morden'].indexOf(chain) < 0) {
            log.error(`Unknown chain: ${chain}`);
            event.returnValue = "fail";
            return;
        }
        event.returnValue = "ok";
        services.shutdown()
            .then(services.notifyStatus.bind(services))
            .then(new Promise((resolve) => {
                services.setup.chain = chain;
                services.setup.chainId = id;
                resolve('ok')
            }))
            .then(services.start.bind(services))
            .then(services.notifyStatus.bind(services))
            .catch((err) => log.error('Failed to Switch Chain', err));
    });

    app.on('quit', () => {
        return services.shutdown()
            .then(() => log.info("All services are stopped"))
            .catch((e) => log.error("Failed to stop services", e));
    });
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
