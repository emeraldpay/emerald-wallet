import { Uuid } from '@emeraldpay/emerald-vault-core';
import { amountFactory, blockchainIdToCode, Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { Dispatched } from '../types';
import { ActionTypes, HistoryAction } from './types';

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
