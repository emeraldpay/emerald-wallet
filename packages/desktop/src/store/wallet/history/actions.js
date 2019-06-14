// @flow
import { Blockchains } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import createLogger from '../../../utils/logger';
import type { Transaction } from './types';
import ActionTypes from './actionTypes';
import { loadTransactions, storeTransactions } from './historyStorage';
import { allTrackedTxs } from './selectors';

const log = createLogger('historyActions');
const txStoreKey = (chainId) => `chain-${chainId}-trackedTransactions`;
const currentChainId = (state) => state.wallet.history.get('chainId');

const getChainId = (chainCode) => Blockchains[chainCode].params.chainId;

function persistTransactions(state, chainId) {
  const txs = allTrackedTxs(state).toJS().filter((t) => (t.chainId === chainId));
  storeTransactions(
    txStoreKey(chainId),
    txs
  );
}

function loadPersistedTransactions(state, chainId) {
  const loaded = loadTransactions(txStoreKey(chainId));

  const txs = loaded.map((tx) => ({
    ...tx,
    chainId,
  }));
  return txs;
}

function updateAndTrack(dispatch, getState, api, txs, chain) {
  const chainId = getChainId(chain);

  const pendingTxs = txs.filter((tx) => !tx.blockNumber).map((t) => ({...t, chainId}));
  if (pendingTxs.length !== 0) {
    dispatch({type: ActionTypes.TRACK_TXS, txs: pendingTxs});
  }

  persistTransactions(getState(), chainId);

  txs.forEach((tx) => {
    ipcRenderer.send('subscribe-tx', tx.hash);
  });
}


export function trackTx(tx, chain) { return (...args) => updateAndTrack(...args, [tx], chain); }
export function trackTxs(txs, chain) { return (...args) => updateAndTrack(...args, txs, chain); }

export function init(chains) {
  return (dispatch, getState) => {
    log.debug('Loading persisted transactions...');

    const storedTxs = [];

    for (const chain of chains) {
      // load history for chain
      const chainId = getChainId(chain);
      storedTxs.push(...loadPersistedTransactions(getState(), chainId));
    }

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
