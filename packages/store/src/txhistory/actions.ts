import { blockchainByName, BlockchainCode, IApi, utils, IStoredTransaction } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { Dispatch } from 'react';
import * as blockchains from '../blockchains';
import { Dispatched, GetState } from '../types';
import { loadTransactions, storeTransactions } from '@emeraldwallet/history-store';
import { allTrackedTxs } from './selectors';
import { ActionTypes, HistoryAction, ILoadStoredTxsAction, IUpdateTxsAction } from './types';

const txStoreKey = (chainId: number) => `chain-${chainId}-trackedTransactions`;

export function persistTransactions (state: any, chainId: number) {
  const txs = allTrackedTxs(state).toJS().filter((t: IStoredTransaction) => (t.chainId === chainId));
  storeTransactions(
    txStoreKey(chainId),
    txs
  );
}

function loadPersistedTransactions (state: any, chainId: number) {
  const loaded = loadTransactions(txStoreKey(chainId), chainId);
  const txs = loaded.map((tx) => ({
    ...tx,
    chainId
  }));
  return txs;
}

function updateAndTrack (dispatch: Dispatch<any>,
                         getState: GetState,
                         api: IApi,
                         txs: IStoredTransaction[],
                         blockchain: BlockchainCode) {
  const chainId = blockchainByName(blockchain).params.chainId;
  const pendingTxs = txs.filter((tx) => !tx.blockNumber).map((t) => ({ ...t, chainId, blockchain }));
  if (pendingTxs.length !== 0) {
    dispatch({ type: ActionTypes.TRACK_TXS, txs: pendingTxs });
  }

  persistTransactions(getState(), chainId);

  txs.forEach((tx) => {
    ipcRenderer.send('subscribe-tx', blockchain, tx.hash);
  });
}

export function trackTx (tx: IStoredTransaction, blockchain: BlockchainCode) {
  return (dispatch: Dispatch<any>, getState: GetState, api: IApi) =>
    updateAndTrack(dispatch, getState, api, [tx], blockchain);
}
export function trackTxs (txs: IStoredTransaction[], blockchain: BlockchainCode) {
  return (dispatch: Dispatch<any>, getState: GetState, api: IApi) =>
    updateAndTrack(dispatch, getState, api, txs, blockchain);
}

export function init (chains: BlockchainCode[]): Dispatched<HistoryAction> {
  return (dispatch, getState) => {
    const storedTxs = [];

    for (const blockchain of chains) {
      // load history for chain
      const chainId = blockchainByName(blockchain).params.chainId;
      storedTxs.push(...loadPersistedTransactions(getState(), chainId));
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
  const requiredConfirms = state.wallet.settings.get('numConfirmations');
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
