// @flow
import createLogger from '../../../utils/logger';

import ActionTypes from './actionTypes';
import { address as isAddress} from '../../../lib/validators';

const log = createLogger('historyActions');

const txStoreKey = (chainId) => `chain-${chainId}-trackedTransactions`;
const currentChainId = (state) => state.wallet.history.get('chainId');

function persistTransactions(state) {
    if (localStorage) {
        // It seems kind of sloppy to store whole txs, when all we
        // really need is hashes. But even if a pending transaction is stored
        // and program closed, the interval-ized ACCOUNT/UPDATE_TX will refresh
        // the data via the RPCAPI. So there is not much to lose except a couple of
        // kilobytes.
        const txes = state.wallet.history.get('trackedTransactions');
        localStorage.setItem(txStoreKey(currentChainId(state)), JSON.stringify(txes.toJS()));
    }
}

function loadPersistedTransactions(state) {
    if (localStorage) {
        // check old history
        // Will be removed after stable release
        const old = localStorage.getItem('trackedTransactions');
        if (old) {
            const txs = JSON.parse(old);
            log.debug(`Loaded ${txs.length} legacy transactions from localStorage`);
            localStorage.removeItem('trackedTransactions');
            return txs;
        }

        const storedTxs = localStorage.getItem(txStoreKey(currentChainId(state)));
        if (storedTxs !== null) {
            const txs = JSON.parse(storedTxs);
            log.debug(`Loaded ${txs.length} transactions from localStorage`);
            return txs;
        }
    }
    return [];
}

export function trackTx(tx) {
    return (dispatch, getState) => {
        dispatch({
            type: ActionTypes.TRACK_TX,
            tx,
        });
        persistTransactions(getState());
    };
}

export function processPending(transactions: Array<any>) {
    return {
        type: ActionTypes.PENDING_TX,
        txList: transactions,
    };
}

export function init(chainId: number) {
    return (dispatch, getState) => {
        log.debug(`Switching to chainId = ${chainId}`);

        // set chain
        dispatch({
            type: ActionTypes.CHAIN_CHANGED,
            chainId,
        });

        // load history for chain
        const storedTxs = loadPersistedTransactions(getState());
        dispatch({
            type: ActionTypes.LOAD_STORED_TXS,
            transactions: storedTxs,
        });
    };
}

export function refreshTransaction(hash: string) {
    return (dispatch, getState, api) =>
        api.geth.eth.getTransactionByHash(hash).then((result) => {
            if (!result) {
                log.info(`No tx for hash ${hash}`);
                dispatch({
                    type: ActionTypes.TRACKED_TX_NOTFOUND,
                    hash,
                });
            } else if (typeof result === 'object') {
                dispatch({
                    type: ActionTypes.UPDATE_TX,
                    tx: result,
                });

                /** TODO: Check for input data **/
                if ((result.creates !== undefined) && (isAddress(result.creates) === undefined)) {
                    dispatch({
                        type: 'CONTRACT/UPDATE_CONTRACT',
                        tx: result,
                        address: result.creates,
                    });
                }
            }
            persistTransactions(getState());
        });
}

/**
 * Refresh only tx with totalRetries <= 10
 */
export function refreshTrackedTransactions() {
    return (dispatch, getState) => {
        getState().wallet.history.get('trackedTransactions')
            .filter((tx) => tx.get('totalRetries', 0) <= 10)
            .map((tx) => dispatch(refreshTransaction(tx.get('hash')))
            );
    };
}

