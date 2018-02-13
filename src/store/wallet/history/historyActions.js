// @flow
import createLogger from '../../../utils/logger';
import type { Transaction } from './types';
import ActionTypes from './actionTypes';
import { address as isAddress} from '../../../lib/validators';
import { storeTransactions, loadTransactions } from './historyStorage';

const log = createLogger('historyActions');
const txStoreKey = (chainId) => `chain-${chainId}-trackedTransactions`;
const currentChainId = (state) => state.wallet.history.get('chainId');

function persistTransactions(state) {
  storeTransactions(
    txStoreKey(currentChainId(state)),
    state.wallet.history.get('trackedTransactions').toJS());
}

function loadPersistedTransactions(state): Array<Transaction> {
  return loadTransactions(txStoreKey(currentChainId(state)));
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

export function refreshTransactions(hashes: Array<string>) {
  return (dispatch, getState, api) => {
    api.geth.ext.getTransactions(hashes).then((txs) => {
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
    const hashes = getState().wallet.history.get('trackedTransactions')
      .filter((tx) => tx.get('totalRetries', 0) <= 10)
      .map((tx) => tx.get('hash'));

    chunk(hashes.toArray(), 20).forEach((group) => dispatch(refreshTransactions(group)));
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
