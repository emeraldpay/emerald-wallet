import { rpc } from '../lib/rpcapi'

export function loadSyncing() {
    return function (dispatch) {
        rpc("eth_syncing", []).then((json) => {
            if (typeof json.result === 'object') {
                dispatch({
                    type: 'NETWORK/SYNCING',
                    syncing: true,
                    status: json.result
                });
            } else {
                dispatch({
                    type: 'NETWORK/SYNCING',
                    syncing: false
                });
            }
        });
    }
}

export function loadHeight() {
    return function (dispatch) {
        rpc("eth_blockNumber", []).then((json) => {
            dispatch({
                type: 'NETWORK/BLOCK',
                height: json.result
            });
        });
    }
}