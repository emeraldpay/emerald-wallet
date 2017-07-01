import {app, ipcMain } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';
import { createWindow, mainWindow } from './mainWindow';
import { RpcApi } from '../src/lib/rpcApi';
import { Services } from './services';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// electron-log
//
// By default it writes logs to the following locations:
//
// on Linux: ~/.config/<app name>/log.log
// on OS X: ~/Library/Logs/<app name>/log.log
// on Windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
log.transports.file.level = isDev ? 'silly' : 'debug';
log.transports.console.level = isDev ? 'debug' : 'info';

const settings = new Store({
    name: 'settings',
    defaults: {
        rpcType: 'none',
        chain: 'morden',
        chainId: 62,
        terms: 'none'
    }
});

// This instance will be called from renderer process through remote.getGlobal("rpc")
// In the future it is possible to replace rpc implementation
global.rpc = new RpcApi();

if (settings.get('rpcType') === 'remote-auto') {
    global.rpc.urlGeth = 'https://mewapi.epool.io';
}

global.launcherConfig = {
    settings: settings.store,
};

log.info('userData: ', app.getPath('userData'));
log.info(`Chain: [type: ${settings.get('rpcType')}, chain: ${settings.get('chain')}]`);
log.info("Settings: ", settings.store);


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    log.info('Starting Emerald...');
    const webContents = createWindow(isDev);

    const services = new Services(webContents);
    services.useSettings(settings);
    services.start().catch((err) => log.error("Failed to start Services", err));
    ipcMain.on('get-status', (event) => {
        event.returnValue = 'ok';
        services.notifyStatus();
    });

    ipcMain.on('settings', (event, newsettings) => {
        event.returnValue = "ok";
        log.info('Update settings', newsettings);
        settings.set('rpcType', newsettings.rpcType);
        if (newsettings.chain) {
            let chain = newsettings.chain;
            if (['mainnet', 'testnet', 'morden'].indexOf(chain) < 0) {
                log.error(`Unknown chain: ${chain}`);
                event.returnValue = "fail";
                return;
            }
            settings.set('chain', chain);
        }
        if (newsettings.chainId) {
            settings.set('chainId', newsettings.chainId);
        }
        services.shutdown()
            .then(services.notifyStatus.bind(services))
            .then(() => services.useSettings(settings))
            .then(services.start.bind(services))
            .then(services.notifyStatus.bind(services))
            .catch((err) => log.error('Failed to restart after changing settings', err));
    });

    ipcMain.on('terms', (event, v) => {
        settings.set('terms', v);
        event.returnValue = "ok";
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
        createWindow(isDev);
    }
});
