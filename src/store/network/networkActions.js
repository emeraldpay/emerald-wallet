import { api } from '../../lib/rpc/api';

import { convert } from 'emerald-js';
import { waitForServices, intervalRates } from '../../store/store';

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
        api.geth.netVersion().then((result) => {
            dispatch({
                type: 'NETWORK/SWITCH_CHAIN',
                id: `${parseInt(result, 10) + 60}`,
            });

            if (getState().launcher.get('chain').get('id') !== result) {
                // TODO: our full node on not expected chain - should we alarm ?

            }
        });
}

export function loadPeerCount() {
    return (dispatch, getState) =>
        api.geth.netPeerCount().then((result) => {
            if (getState().network.get('peerCount') !== convert.toNumber(result)) {
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
                // TODO: hz, remove it ?
                // if (!syncing) {
                //     dispatch(loadNetworkVersion());
                // }
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

