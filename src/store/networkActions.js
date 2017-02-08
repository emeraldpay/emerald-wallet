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
                setTimeout(() => dispatch(loadSyncing()), 1000)
            } else {
                dispatch({
                    type: 'NETWORK/SYNCING',
                    syncing: false
                });
                setTimeout(() => dispatch(loadHeight(true)), 1000)
            }
        });
    }
}

let watchingHeight = false;

export function loadHeight(watch) {
    return function (dispatch) {
        rpc("eth_blockNumber", []).then((json) => {
            dispatch({
                type: 'NETWORK/BLOCK',
                height: json.result
            });
            if (watch && !watchingHeight) {
                watchingHeight = true;
                setTimeout(() => dispatch(loadHeight(true)), 5000);
            }
        });
    }
}