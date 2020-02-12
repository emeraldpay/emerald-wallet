import { blockchainByName, BlockchainCode, IApi, IStoredTransaction, utils } from '@emeraldwallet/core';
import {
  loadTransactions, loadTransactions2, removeTransactions, storeTransactions2
} from '@emeraldwallet/history-store';
import { ipcRenderer } from 'electron';
import { Dispatch } from 'react';
import * as blockchains from '../blockchains';
import * as settings from '../settings';
import { Dispatched, GetState } from '../types';
import { allTrackedTxs } from './selectors';
import { ActionTypes, HistoryAction, ILoadStoredTxsAction, IUpdateTxsAction } from './types';

const txStoreKey = (chainId: number) => `chain-${chainId}-trackedTransactions`;

export function persistTransactions (state: any, chainCode: BlockchainCode) {
  const txs = allTrackedTxs(state).toJS().filter((t: IStoredTransaction) => (t.blockchain === chainCode));
  // always store to new TxStore
  storeTransactions2(chainCode, txs);
}

function loadPersistedTransactions (chainCode: BlockchainCode) {
  // load from old local storage
  const chainId: number = blockchainByName(chainCode).params.chainId;
  const loaded = loadTransactions(txStoreKey(chainId), chainId);
  let txs: IStoredTransaction[] = loaded.map((tx: IStoredTransaction) => ({
    ...tx,
    chainId
  } as IStoredTransaction));

  // new TxStore migration
  if (txs.length > 0) {
    // store txs from local storage to new store
    storeTransactions2(chainCode, txs);
    // remove from local storage
    removeTransactions(txStoreKey(chainId));
  }
  // load from new store
  txs = loadTransactions2(chainCode);
  return txs;
}

function updateAndTrack (
  dispatch: Dispatch<any>, getState: GetState, txs: IStoredTransaction[], blockchain: BlockchainCode
) {
  const chainId = blockchainByName(blockchain).params.chainId;
  const pendingTxs = txs
    .filter((tx) => !tx.blockNumber)
    .map((t) => ({ ...t, chainId, blockchain }));

  if (pendingTxs.length !== 0) {
    // add txs to redux store
    dispatch({ type: ActionTypes.TRACK_TXS, txs: pendingTxs });
  }

  persistTransactions(getState(), blockchain);

  txs.forEach((tx) => {
    ipcRenderer.send('subscribe-tx', blockchain, tx.hash);
  });
}

export function trackTxs (txs: IStoredTransaction[], blockchain: BlockchainCode) {
  return (dispatch: Dispatch<any>, getState: GetState, api: IApi) =>
    updateAndTrack(dispatch, getState, txs, blockchain);
}

export function init (chains: BlockchainCode[]): Dispatched<HistoryAction> {
  return (dispatch, getState) => {
    const storedTxs = [];

    for (const chainCode of chains) {
      // load history for chain
      const txs = loadPersistedTransactions(chainCode);
      storedTxs.push(...txs);
    }

    dispatch(loadStoredTxsAction(storedTxs));
  };
}

function loadStoredTxsAction (txs: any): ILoadStoredTxsAction {
  return {
    type: ActionTypes.LOAD_STORED_TXS,
    transactions: txs
  };
}

const txUnconfirmed = (state: any, tx: any) => {
  const chainCode = tx.get('blockchain').toLowerCase();
  const currentBlock = blockchains.selectors.getHeight(state, chainCode);
  const txBlockNumber = tx.get('blockNumber');

  if (!txBlockNumber) {
    const since = utils.parseDate(tx.get('since'), new Date())!;
    const dayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
    return since.getTime() > dayAgo;
  }
  const numConfirmsForTx = txBlockNumber - currentBlock;
  const requiredConfirms = settings.selectors.numConfirms(state);
  return requiredConfirms < numConfirmsForTx;
};

/**
 * Refresh only tx with totalRetries <= 10
 */
export function refreshTrackedTransactions (): Dispatched<HistoryAction> {
  return (dispatch, getState) => {
    const state = getState();
    allTrackedTxs(state)
      .filter((tx: any) => tx.get('totalRetries', 0) <= 10)
      .filter((tx: any) => txUnconfirmed(state, tx))
      .forEach((tx: any) => ipcRenderer.send('subscribe-tx', tx.get('blockchain'), tx.get('hash')));
  };
}

export function updateTxs (transactions: any): IUpdateTxsAction {
  return {
    type: ActionTypes.UPDATE_TXS,
    payload: transactions
  };
}
