// @flow
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import createLogger from '../../../utils/logger';
import type { Transaction } from './types';
import ActionTypes from './actionTypes';
import { loadTransactions, storeTransactions } from './historyStorage';
import { allTrackedTxs } from './selectors';

const log = createLogger('historyActions');
const txStoreKey = (chainId) => `chain-${chainId}-trackedTransactions`;
const currentChainId = (state) => state.wallet.history.get('chainId');

function persistTransactions(state) {
  storeTransactions(
    txStoreKey(currentChainId(state)),
    allTrackedTxs(state).toJS()
  );
}

function loadPersistedTransactions(state): Array<Transaction> {
  const chainId = currentChainId(state);
  const loaded = loadTransactions(txStoreKey(chainId));

  const txs = loaded.map((tx) => ({
      ...tx,
      chainId: chainId,
  }));
  return txs;
}

function updateAndTrack(dispatch, getState, api, txs) {
  const pendingTxs = txs.filter((tx) => !tx.blockNumber);
  if (pendingTxs.length !== 0) {
    dispatch({type: ActionTypes.TRACK_TXS, txs: pendingTxs});
  }

  persistTransactions(getState());

  txs.forEach((tx) => {
    ipcRenderer.send('subscribe-tx', tx.hash);
  });
}


export function trackTx(tx) { return (...args) => updateAndTrack(...args, [tx]); }
export function trackTxs(txs) { return (...args) => updateAndTrack(...args, txs); }

export function init(chainId: number) {
  return (dispatch, getState) => {
    log.debug(`Loading persisted transactions...`);


    // load history for chain
    const storedTxs = loadPersistedTransactions(getState());
    dispatch({
      type: ActionTypes.LOAD_STORED_TXS,
      transactions: storedTxs,
    });
  };
}

const txUnconfirmed = (state, tx) => {
  const currentBlock = state.network.get('currentBlock').get('height');
  const txBlockNumber = tx.get('blockNumber');

  if (!txBlockNumber) {
    return true;
  }

  const numConfirmsForTx = txBlockNumber - currentBlock;

  const requiredConfirms = state.wallet.settings.get('numConfirmations');
  return requiredConfirms < numConfirmsForTx;
};

/**
 * Refresh only tx with totalRetries <= 10
 */
export function refreshTrackedTransactions() {
  return (dispatch, getState) => {
    const state = getState();
    allTrackedTxs(state)
      .filter((tx) => tx.get('totalRetries', 0) <= 10)
      .filter((tx) => txUnconfirmed(state, tx))
      .map((tx) => tx.get('hash'))
      .forEach((hash) => ipcRenderer.send('subscribe-tx', hash));
  };
}
