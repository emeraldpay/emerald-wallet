import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { api } from 'lib/rpc/api';

import { gotoScreen } from 'store/screenActions';
import { waitForServicesRestart } from 'store/store';
import { loadAccountsList } from './accountActions';


function isGethReady(state) {
    return state.launcher.getIn(['geth', 'status']) === 'ready';
}

export function readConfig() {
    if (typeof window.process !== 'undefined') {
        const remote = global.require('electron').remote;
        const launcherConfig = remote.getGlobal('launcherConfig').get();

        log.debug(`Got launcher config from electron: ${JSON.stringify(launcherConfig)}`);

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
        api.geth.call('web3_clientVersion', []).then((result) => {
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

export function useRpc(gethProvider) {
    return (dispatch) => {
        dispatch({
            type: 'LAUNCHER/CONFIG',
            config: {
                ...gethProvider,
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
    };
}

export function saveSettings(extraSettings) {
    extraSettings = extraSettings || {};
    return (dispatch, getState) => {
        const geth = getState().launcher.get('geth').toJS();
        const chain = getState().launcher.get('chain').toJS();

        const settings = { geth, chain, ...extraSettings };

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
    return (dispatch, getState) => {
        ipcRenderer.on('launcher', (event, type, message) => {
            log.debug('launcher listener: ', 'type', type, 'message', message);

            dispatch({
                type: `LAUNCHER/${type}`,
                ...message,
            });

            const state = getState();

            if (isGethReady(state)) {
                dispatch(loadClientVersion());
                dispatch(loadAccountsList());
            }
        });
    };
}

export function connecting(value) {
    return {
        type: 'LAUNCHER/CONNECTING',
        value,
    };
}
