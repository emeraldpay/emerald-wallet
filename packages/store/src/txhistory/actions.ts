import { Uuid } from '@emeraldpay/emerald-vault-core';
import { Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { Dispatched } from '../types';
import { ActionTypes, HistoryAction, StoredTransaction } from './types';

export function loadTransactions(walletId: Uuid, entryIds: string[]): Dispatched<HistoryAction> {
  return async (dispatch, getState) => {
    const state = getState();

    if (walletId === state.history.walletId) {
      return;
    }

    const transactions: PersistentState.Transaction[] = await ipcRenderer.invoke(Commands.LOAD_TX_HISTORY, entryIds);

    dispatch({
      walletId,
      transactions: transactions.map((tx) => new StoredTransaction(tx)),
      type: ActionTypes.LOAD_STORED_TXS,
    });
  };
}

export function updateTransaction(walletId: Uuid, tx: PersistentState.Transaction): Dispatched<void> {
  return (dispatch, getState) => {
    const state = getState();

    if (walletId !== state.history.walletId) {
      return;
    }

    dispatch({
      transaction: new StoredTransaction(tx),
      type: ActionTypes.UPDATE_STORED_TX,
    });
  };
}
