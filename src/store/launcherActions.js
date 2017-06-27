import { ipcRenderer } from 'electron';
import log from 'loglevel';
import rpc from 'lib/rpc'

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

export function useRpc(type) {
    return function (dispatch) {
        dispatch({
            type: 'LAUNCHER/CONFIG',
            config: {
                chain: {
                    rpc: type
                }
            },
        });
        dispatch({
            type: 'LAUNCHER/SETTINGS',
            updated: true
        })
    }
}

export function saveSettings(extraSettings) {
    extraSettings = extraSettings || {};
    return function (dispatch, getState) {
        const rpcType = getState().launcher.getIn(['chain', 'rpc']);
        const settings = {rpcType, ...extraSettings};
        log.info("Save settings", settings);
        ipcRenderer.send("settings", settings);
        dispatch({
            type: 'LAUNCHER/SETTINGS',
            updated: false
        })
    }
}

export function listenElectron() {
    return function (dispatch) {
        ipcRenderer.on('launcher', (event, type, message) => {
            dispatch({
                type: `LAUNCHER/${type}`, ...message
            });
            if (type === 'CHAIN') {
                dispatch({
                    type: 'NETWORK/SWITCH_CHAIN',
                    network: message.chain,
                    id: message.chainId,
                    rpcType: message.rpc
                });
            } else if (type === 'RPC') {
                log.info("Use RPC URL", message.url);
                rpc.urlGeth = message.url
            }
        });
    }
}