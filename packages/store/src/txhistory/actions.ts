import { Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { ActionTypes, StoredTransaction, UpdateStoredTxAction } from './types';
import { Dispatched } from '../types';

export function loadTransactions(walletId: Uuid, cursor?: string): Dispatched<void> {
  return async (dispatch, getState, extra) => {
    const state = getState();

    let walletCursor = cursor;

    if (walletId !== state.history.walletId) {
      walletCursor = undefined;
    }

    const page: PersistentState.PageResult<PersistentState.Transaction> = await extra.api.txHistory.query(
      { wallet: walletId },
      { cursor: walletCursor, limit: 10 },
    );

    dispatch({
      type: ActionTypes.LOAD_STORED_TXS,
      walletId,
      cursor: page.cursor,
      transactions: page.items.map((tx) => new StoredTransaction(tx)),
    });
  };
}

export function updateTransaction(walletId: Uuid, transaction: PersistentState.Transaction): UpdateStoredTxAction {
  return {
    type: ActionTypes.UPDATE_STORED_TX,
    walletId,
    transaction,
  };
}

export function getTransactionMeta(
  blockchain: BlockchainCode,
  txId: string,
): Dispatched<PersistentState.TxMeta | null> {
  return () => ipcRenderer.invoke(Commands.GET_TX_META, blockchain, txId);
}

export function setTransactionMeta(meta: PersistentState.TxMeta): Dispatched<PersistentState.TxMeta> {
  return () => ipcRenderer.invoke(Commands.SET_TX_META, meta);
}
