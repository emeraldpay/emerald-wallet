import { Uuid } from '@emeraldpay/emerald-vault-core';
import {
  amountFactory,
  blockchainByName,
  BlockchainCode,
  blockchainIdToCode,
  Blockchains,
  Commands,
  IStoredTransaction,
  PersistentState,
  utils,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { Dispatch } from 'redux';
import * as blockchains from '../blockchains';
import { Dispatched, GetState, IState } from '../types';
import { ActionTypes, HistoryAction, UpdateTxsAction } from './types';

export function loadTransactions(walletId: Uuid, entryIds: string[]): Dispatched<HistoryAction> {
  return async (dispatch, getState) => {
    const state = getState();

    if (walletId === state.history.walletId) {
      return;
    }

    let transactions: PersistentState.Transaction[] = await ipcRenderer.invoke(Commands.LOAD_TX_HISTORY, entryIds);

    transactions = transactions.map((tx) => {
      const factory = amountFactory(blockchainIdToCode(tx.blockchain));

      return {
        ...tx,
        changes: tx.changes.map((change) => {
          const amountValue = factory(change.amount);

          return {
            ...change,
            amountValue,
            // TODO Remove when available in store
            direction: amountValue.isPositive() ? PersistentState.Direction.EARN : PersistentState.Direction.SPEND,
          };
        }),
      };
    });

    dispatch({
      transactions,
      walletId,
      type: ActionTypes.LOAD_STORED_TXS,
    });
  };
}

function txUnconfirmed(state: IState, tx: PersistentState.Transaction): boolean {
  const blockchainCode = blockchainIdToCode(tx.blockchain).toLowerCase();
  const blockchain = Blockchains[tx.blockchain];

  const currentBlock = blockchains.selectors.getHeight(state, blockchainCode);
  const blockNumber = parseInt(tx.block?.blockId.toString() ?? '0');

  if (blockNumber === 0) {
    const since = utils.parseDate(tx.sinceTimestamp, new Date())?.getTime() ?? 0;
    const tooOld = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;

    return since > tooOld;
  }

  const requiredConfirms = blockchain.params.confirmations;
  const numConfirmsForTx = blockNumber - currentBlock;

  return requiredConfirms < numConfirmsForTx;
}

export function refreshTrackedTransactions(): Dispatched<HistoryAction> {
  return (dispatch, getState) => {
    const state = getState();
    const history = state.history.transactions.values();

    [...history]
      .filter((tx) => txUnconfirmed(state, tx))
      .forEach((tx) => ipcRenderer.send('subscribe-tx', blockchainIdToCode(tx.blockchain), tx.txId));
  };
}

async function updateAndTrack(
  dispatch: Dispatch,
  getState: GetState,
  txs: IStoredTransaction[],
  blockchain: BlockchainCode,
): Promise<void> {
  const chainId = blockchainByName(blockchain).params.chainId;
  const pendingTxs = txs.filter((tx) => !tx.blockNumber).map((t) => ({ ...t, chainId, blockchain }));

  if (pendingTxs.length > 0) {
    dispatch({ type: ActionTypes.TRACK_TXS, txs: pendingTxs });
  }

  txs.forEach((tx) => ipcRenderer.send('subscribe-tx', blockchain, tx.hash));
}

export function trackTxs(txs: IStoredTransaction[], blockchain: BlockchainCode): Dispatched<void> {
  return (dispatch, getState) => updateAndTrack(dispatch, getState, txs, blockchain);
}

export function updateTxs(transactions: IStoredTransaction[]): UpdateTxsAction {
  return {
    type: ActionTypes.UPDATE_TXS,
    payload: transactions,
  };
}
