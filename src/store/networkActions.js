import { rpc } from '../lib/rpc';
import { start } from '../store/store';

let watchingHeight = false;
//  (whilei: development: loading so often slows things a lot for me and clutters logs)
const loadSyncRate = 60 * 1000; // milliseconds
const loadHeightRate = 5 * 60 * 1000; // ditto

export function loadHeight(watch) {
    return (dispatch) =>
        rpc.call('eth_blockNumber', []).then((result) => {
            dispatch({
                type: 'NETWORK/BLOCK',
                height: result,
            });
            if (watch && !watchingHeight) {
                watchingHeight = true;
                setTimeout(() => dispatch(loadHeight(true)), loadHeightRate);
            }
        });
}

export function loadNetworkVersion() {
    return (dispatch, getState) =>
        rpc.call('net_version', []).then((result) => {
            if (getState().network.get('chain').get('id') !== result) {
                dispatch({
                    type: 'NETWORK/SWITCH_CHAIN',
                    id: result,
                });
            }
        });
}

export function loadSyncing() {
    return (dispatch, getState) =>
        rpc.call('eth_syncing', []).then((result) => {
            const syncing = getState().network.get('sync').get('syncing');
            if (typeof result === 'object') {
                if (!syncing) dispatch(loadNetworkVersion());
                dispatch({
                    type: 'NETWORK/SYNCING',
                    syncing: true,
                    status: result,
                });
                setTimeout(() => dispatch(loadSyncing()), loadSyncRate);
            } else {
                dispatch({
                    type: 'NETWORK/SYNCING',
                    syncing: false,
                });
                setTimeout(() => dispatch(loadHeight(true)), loadSyncRate);
            }
        });
}

export function switchChain(network, id) {
    return (dispatch) =>
        rpc.call('backend_switchChain', [network]).then((result) => {
            console.debug('switch chain', result);
            dispatch({
                type: 'NETWORK/SWITCH_CHAIN',
                network,
                id,
            });
            start();
        });
}
