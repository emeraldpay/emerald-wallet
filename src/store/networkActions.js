import log from 'electron-log';
import { ipcRenderer } from 'electron';
import { api } from 'lib/rpc/api';

import { toNumber } from '../lib/convert';
import { waitForServices, intervalRates } from '../store/store';

let watchingHeight = false;

export function loadHeight(watch) {
    return (dispatch) =>
        api.geth.call('eth_blockNumber', []).then((result) => {
            dispatch({
                type: 'NETWORK/BLOCK',
                height: result,
            });
            if (watch && !watchingHeight) {
                watchingHeight = true;
                setTimeout(() => dispatch(loadHeight(true)), intervalRates.continueLoadHeightRate);
            }
        });
}

export function loadNetworkVersion() {
    return (dispatch, getState) =>
        api.geth.call('net_version', []).then((result) => {
            if (getState().launcher.get('chain').get('id') !== result) {
                //TODO: our full node on not expected chain - should we alarm ?
                dispatch({
                    type: 'NETWORK/SWITCH_CHAIN',
                    id: result,
                    rpcType: getState().launcher.getIn(['geth', 'type']),
                });
            }
        });
}

export function loadPeerCount() {
    return (dispatch, getState) =>
        api.geth.call('net_peerCount', []).then((result) => {
            if (getState().network.get('peerCount') !== toNumber(result)) {
                dispatch({
                    type: 'NETWORK/PEER_COUNT',
                    peerCount: result,
                });
            }
        });
}

export function loadSyncing() {
    return (dispatch, getState) => {
        const repeat = getState().launcher.getIn(['geth', 'type']) === 'local';
        api.geth.call('eth_syncing', []).then((result) => {
            const syncing = getState().network.get('sync').get('syncing');
            if (typeof result === 'object') {
                if (!syncing) dispatch(loadNetworkVersion());
                dispatch({
                    type: 'NETWORK/SYNCING',
                    syncing: true,
                    status: result,
                });
                if (repeat) {
                    setTimeout(() => dispatch(loadSyncing()), intervalRates.continueLoadSyncRate);
                }
            } else {
                dispatch({
                    type: 'NETWORK/SYNCING',
                    syncing: false,
                });
                setTimeout(() => dispatch(loadHeight(true)), intervalRates.continueLoadSyncRate);
            }
        });
    };
}

export function switchChain(network, id) {
    return (dispatch) => {
        ipcRenderer.sendSync('switch-chain', network, id);
        waitForServices();
    };
}
