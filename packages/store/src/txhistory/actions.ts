import {
  blockchainByName,
  BlockchainCode,
  Blockchains,
  Commands,
  IBackendApi,
  IStoredTransaction,
  utils,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { Dispatch } from 'redux';
import * as blockchains from '../blockchains';
import { Dispatched, GetState, IState } from '../types';
import { allTrackedTxs } from './selectors';
import { ActionTypes, HistoryAction, IUpdateTxsAction } from './types';

export function init(): Dispatched<HistoryAction> {
  return async (dispatch) => {
    const transactions = await ipcRenderer.invoke(Commands.LOAD_TX_HISTORY);

    dispatch({
      transactions,
      type: ActionTypes.LOAD_STORED_TXS,
    });
  };
}

export async function persistTransactions(
  state: IState,
  backendApi: IBackendApi,
  chainCode: BlockchainCode,
): Promise<void> {
  const txs = allTrackedTxs(state).filter((t: IStoredTransaction) => t.blockchain === chainCode);

  await backendApi.persistTransactions(chainCode, txs);
}

function txUnconfirmed(state: IState, tx: IStoredTransaction): boolean {
  const chainCode = tx.blockchain.toLowerCase();
  const blockchain = Blockchains[tx.blockchain];
  const currentBlock = blockchains.selectors.getHeight(state, chainCode);
  const txBlockNumber = parseInt(tx.blockNumber?.toString() ?? '0');

  if (!txBlockNumber) {
    const since = utils.parseDate(tx.since, new Date())?.getTime() ?? 0;
    const tooOld = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;

    return since > tooOld;
  }

  const requiredConfirms = blockchain.params.confirmations;
  const numConfirmsForTx = txBlockNumber - currentBlock;

  return requiredConfirms < numConfirmsForTx;
}

export function refreshTrackedTransactions(): Dispatched<HistoryAction> {
  return (dispatch, getState) => {
    const state = getState();

    allTrackedTxs(state)
      .filter((tx) => (tx.totalRetries ?? 0) <= 10)
      .filter((tx) => txUnconfirmed(state, tx))
      .forEach((tx) => ipcRenderer.send('subscribe-tx', tx.blockchain, tx.hash));
  };
}

async function updateAndTrack(
  dispatch: Dispatch,
  getState: GetState,
  txs: IStoredTransaction[],
  blockchain: BlockchainCode,
  backendApi: IBackendApi,
): Promise<void> {
  const chainId = blockchainByName(blockchain).params.chainId;
  const pendingTxs = txs.filter((tx) => !tx.blockNumber).map((t) => ({ ...t, chainId, blockchain }));

  if (pendingTxs.length > 0) {
    dispatch({ type: ActionTypes.TRACK_TXS, txs: pendingTxs });
  }

  await persistTransactions(getState(), backendApi, blockchain);

  txs.forEach((tx) => {
    ipcRenderer.send('subscribe-tx', blockchain, tx.hash);
  });
}

export function trackTxs(txs: IStoredTransaction[], blockchain: BlockchainCode): Dispatched<void> {
  return (dispatch, getState, extra) => updateAndTrack(dispatch, getState, txs, blockchain, extra.backendApi);
}

export function updateTxs(transactions: IStoredTransaction[]): IUpdateTxsAction {
  return {
    type: ActionTypes.UPDATE_TXS,
    payload: transactions,
  };
}
