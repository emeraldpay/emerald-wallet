// @flow
import createLogger from '../../../utils/logger';
import type { Transaction } from './types';
import ActionTypes from './actionTypes';
import { address as isAddress} from '../../../lib/validators';
import { storeTransactions, loadTransactions } from './historyStorage';
import { allTrackedTxs, selectByHash } from './selectors';

const log = createLogger('historyActions');
const txStoreKey = (chainId) => `chain-${chainId}-trackedTransactions`;
const currentChainId = (state) => state.wallet.history.get('chainId');

function persistTransactions(state) {
  storeTransactions(
    txStoreKey(currentChainId(state)),
    allTrackedTxs(state).toJS());
}

function loadPersistedTransactions(state): Array<Transaction> {
  return loadTransactions(txStoreKey(currentChainId(state)));
}

export function trackTx(tx) {
  return (dispatch, getState) => {
    persistTransactions(getState());
    return dispatch(trackTxAction(tx));
  };
}

export function trackTxAction(tx) {
  return {
    type: ActionTypes.TRACK_TX,
    tx,
  };
}

export function processPending(transactions: Array<any>) {
  return (dispatch, getState) => {
    persistTransactions(getState());

    return dispatch({
      type: ActionTypes.PENDING_TX,
      txList: transactions,
    });
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

export function refreshTransactions(hashes: Array<string>) {
  return (dispatch, getState, api) => {
    return api.geth.ext.getTransactions(hashes).then((txs) => {
      const found = [];
      txs.forEach((t) => {
        if (t.result && typeof t.result === 'object') {
          found.push(t.result);
        }
      });

      dispatch({
        type: ActionTypes.UPDATE_TXS,
        transactions: found,
      });

      // update timestamps
      const state = getState();
      const promises = found.map((t) => {
        const tx = selectByHash(state, t.hash);

        if (!tx || tx.get('timestamp')) {
          return Promise.resolve();
        }

        return api.geth.eth.getBlock(tx.get('blockNumber'))
          .then((block) => {
            return dispatch({
              type: ActionTypes.UPDATE_TX,
              tx: { hash: t.hash, timestamp: block.timestamp },
            });
          });
      });

      return Promise.all(promises);
    });
  };
}

export function refreshTransaction(hash: string) {
  return (dispatch, getState, api) =>
    api.geth.eth.getTransaction(hash).then((result) => {
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
    const hashes = allTrackedTxs(getState())
      .filter((tx) => tx.get('totalRetries', 0) <= 10)
      .map((tx) => tx.get('hash'));

    const promises = chunk(hashes.toArray(), 20)
      .map((group) => () => dispatch(refreshTransactions(group)));

    const runSeries = (proms) => {
      if (proms.length === 0) { return true; }
      const prom = proms[0]();

      if (proms.length > 1) {
        prom.then(() => runSeries(promises.slice(1)));
      }

      return prom;
    };

    return runSeries(promises);
  };
}

/**
 * Split an array into chunks of a given size
 */
function chunk(array, chunkSize) {
  const groups = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    groups.push(array.slice(i, i + chunkSize));
  }
  return groups;
}
