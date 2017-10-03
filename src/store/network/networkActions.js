import { convert } from 'emerald-js';

import { waitForServices, intervalRates } from '../../store/store';
import createLogger from '../../utils/logger';
import ActionTypes from './actionTypes';

const log = createLogger('networkActions');

let watchingHeight = false;

export function loadHeight(watch) {
    return (dispatch, getState, api) =>
        api.geth.eth.blockNumber().then((result) => {
            dispatch({
                type: ActionTypes.BLOCK,
                height: result,
            });
            if (watch && !watchingHeight) {
                watchingHeight = true;
                setTimeout(() => dispatch(loadHeight(true)), intervalRates.continueLoadHeightRate);
            }
        });
}

export function loadNetworkVersion() {
    return (dispatch, getState, api) =>
        api.geth.net.version().then((result) => {
            dispatch({
                type: ActionTypes.PEER_COUNT,
                id: `${parseInt(result, 10) + 60}`,
            });

            if (getState().launcher.get('chain').get('id') !== result) {
                // TODO: our full node on not expected chain - should we alarm ?

            }
        });
}

export function loadPeerCount() {
    return (dispatch, getState, api) =>
        api.geth.net.peerCount().then((result) => {
            if (getState().network.get('peerCount') !== convert.toNumber(result)) {
                dispatch({
                    type: ActionTypes.PEER_COUNT,
                    peerCount: result,
                });
            }
        });
}

export function loadSyncing() {
    return (dispatch, getState, api) => {
        const repeat = getState().launcher.getIn(['geth', 'type']) === 'local';
        api.geth.eth.syncing().then((result) => {
            const syncing = getState().network.get('sync').get('syncing');
            if (typeof result === 'object') {
                // TODO: hz, remove it ?
                // if (!syncing) {
                //     dispatch(loadNetworkVersion());
                // }
                dispatch({
                    type: ActionTypes.SYNCING,
                    syncing: true,
                    status: result,
                });
                if (repeat) {
                    setTimeout(() => dispatch(loadSyncing()), intervalRates.continueLoadSyncRate);
                }
            } else {
                dispatch({
                    type: ActionTypes.SYNCING,
                    syncing: false,
                });
                setTimeout(() => dispatch(loadHeight(true)), intervalRates.continueLoadSyncRate);
            }
        });
    };
}

export function getGasPrice() {
    return (dispatch, getState, api) => {
        api.geth.eth.gasPrice().then((result) => {
            dispatch({
                type: ActionTypes.GAS_PRICE,
                value: result,
            });
        }).catch((error) => log.error(error));
    };
}
