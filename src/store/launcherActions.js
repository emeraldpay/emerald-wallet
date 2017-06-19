import { ipcRenderer } from 'electron';

export function readConfig() {
    if (typeof window.process !== 'undefined') {
        const remote = global.require('electron').remote;
        const launcherConfig = remote.getGlobal('launcherConfig');
        return {
            type: 'LAUNCHER/CONFIG',
            config: launcherConfig,
            launcherType: 'electron'
        }
    } else {
        return {
            type: 'LAUNCHER/CONFIG',
            config: {},
            launcherType: 'browser'
        }
    }
}

export function listenElectron() {
    return function (dispatch) {
        ipcRenderer.on('launcher', (event, type, message) => {
            dispatch({
                type: `LAUNCHER/${type}`, ...message
            })
        });
    }
}