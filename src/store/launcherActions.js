import { ipcRenderer } from 'electron';
import log from 'electron-log';
import rpc from 'lib/rpc';
import { waitForServicesRestart } from 'store/store';
import { loadAccountsList } from './accountActions';
import { gotoScreen } from 'store/screenActions';

export function readConfig() {
    if (typeof window.process !== 'undefined') {
        const remote = global.require('electron').remote;
        const launcherConfig = remote.getGlobal('launcherConfig');
        return {
            type: 'LAUNCHER/CONFIG',
            config: launcherConfig,
            launcherType: 'electron',
        };
    }
    return {
        type: 'LAUNCHER/CONFIG',
        config: {},
        launcherType: 'browser',
    };
}

export function loadClientVersion() {
    return (dispatch) => {
        rpc.call('web3_clientVersion', []).then((result) => {
            log.debug(result);
            dispatch({
                type: 'LAUNCHER/CONFIG',
                config: {
                    chain: {
                        client: result,
                    },
                },
            });
            dispatch({
                type: 'LAUNCHER/SETTINGS',
                updated: true,
            });
        });
    };
}

export function useRpc(option) {
    return (dispatch) => {
        dispatch({
            type: 'LAUNCHER/CONFIG',
            config: {
                chain: {
                    rpc: option,
                },
            },
        });
        dispatch({
            type: 'LAUNCHER/SETTINGS',
            updated: true,
        });
    };
}

export function agreeOnTerms(v) {
    ipcRenderer.send('terms', v);
    return {
        type: 'LAUNCHER/TERMS',
        version: v,
    }
}

export function saveSettings(extraSettings) {
    extraSettings = extraSettings || {};
    return (dispatch, getState) => {
        const rpcType = getState().launcher.getIn(['chain', 'rpc']);
        const client = getState().launcher.getIn(['chain', 'client']);
        const settings = {rpcType, client, ...extraSettings};
        log.info('Save settings', settings);
        waitForServicesRestart();
        ipcRenderer.send('settings', settings);
        dispatch({
            type: 'LAUNCHER/SETTINGS',
            updated: false,
        });
    };
}

export function listenElectron() {
    return (dispatch) => {
        ipcRenderer.on('launcher', (event, type, message) => {
            log.debug('launcher listener: ', 'type', type, 'message', message);
            dispatch({
                type: `LAUNCHER/${type}`, ...message,
            });
            if (type === 'CHAIN') {
                dispatch({
                    type: 'NETWORK/SWITCH_CHAIN',
                    network: message.chain,
                    id: message.chainId,
                    rpcType: message.rpc,
                });
                dispatch(loadAccountsList());
            } else if (type === 'RPC') {
                log.info('Use RPC URL', message.url);
                rpc.urlGeth = message.url;
            }
            dispatch(loadClientVersion());
        });
    };
}

export function connecting(value) {
    return {
        type: "LAUNCHER/CONNECTING",
        value
    }
}
