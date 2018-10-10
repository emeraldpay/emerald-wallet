// @flow
import {convert} from 'emerald-js';

import createLogger from '../../../utils/logger';
import type { Transaction } from './types';
import ActionTypes from './actionTypes';
import { address as isAddress} from '../../../lib/validators';
import { storeTransactions, loadTransactions } from './historyStorage';
import { allTrackedTxs } from './selectors';


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

function updateAndTrack(dispatch, getState, api, txs) {
  const pendingTxs = txs.filter((tx) => !tx.blockNumber);
  const nonPendingTxs = txs.filter((tx) => pendingTxs.indexOf(tx) === -1);

  let returnPromise;

  if (pendingTxs.length !== 0) {
    dispatch({type: ActionTypes.TRACK_TXS, txs: pendingTxs});
  }

  if (nonPendingTxs.length !== 0) {
    const blockNumbers = nonPendingTxs.map((tx) => tx.blockNumber);
    returnPromise = api.geth.ext.getBlocksByNumbers(blockNumbers).then((blocks) => {
      return nonPendingTxs.map((tx) => ({
        ...tx,
        timestamp: blocks.find(({ hash }) => hash === tx.blockHash).timestamp,
      }));
    })
      .then((transactions) => {
        dispatch({type: ActionTypes.TRACK_TXS, txs: transactions});
      });
  }

  persistTransactions(getState());
  return returnPromise;
}


export function trackTx(tx) { return (...args) => updateAndTrack(...args, [tx]); }
export function trackTxs(txs) { return (...args) => updateAndTrack(...args, txs); }

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
  return (dispatch, getState, api) => {
    const state = getState();

    const hashes = allTrackedTxs(state)
      .filter((tx) => tx.get('totalRetries', 0) <= 10)
      .filter((tx) => txUnconfirmed(state, tx))
      .map((tx) => tx.get('hash'));

    if (hashes.size === 0) {
      return;
    }

    return api.geth.ext.getTransactions(hashes).then((results) => {
      const transactions = results.map((r) => r.result).filter((tx) => tx && tx.blockNumber);

      if (transactions.length === 0) { return; }

      return api.geth.ext.getBlocksByNumbers(transactions.map((tx) => tx.blockNumber)).then((blocks) => {
        return transactions.map((tx) => ({
          ...tx,
          timestamp: blocks.find(({ hash }) => hash === tx.blockHash).timestamp,
        }));
      });
    }).then((transactions) => {
      if (!transactions || transactions.length === 0) { return; }

      dispatch({ type: ActionTypes.UPDATE_TXS, transactions });

      return persistTransactions(getState());
    });
  };
}
