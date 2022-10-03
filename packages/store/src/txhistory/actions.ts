import { Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { ActionTypes, LastTxIdAction, RemoveStoredTxAction, StoredTransaction, UpdateStoredTxAction } from './types';
import { Dispatched } from '../types';

export function loadTransactions(walletId: Uuid, initial: boolean): Dispatched<void> {
  return async (dispatch, getState, extra) => {
    const { history } = getState();

    if (walletId === history.walletId && (initial || history.cursor === null)) {
      return;
    }

    let walletCursor = history.cursor;

    if (walletId !== history.walletId) {
      walletCursor = undefined;
    }

    const page: PersistentState.PageResult<PersistentState.Transaction> = await extra.api.txHistory.query(
      { wallet: walletId },
      { cursor: walletCursor, limit: 20 },
    );

    const transactions = await Promise.all(
      page.items.map(async (tx) => {
        const meta = await extra.api.txMeta.get(blockchainIdToCode(tx.blockchain), tx.txId);

        return new StoredTransaction(tx, meta);
      }),
    );

    dispatch({
      type: ActionTypes.LOAD_STORED_TXS,
      transactions,
      walletId,
      cursor: page.cursor,
    });
  };
}

export function removeTransaction(txId: string): RemoveStoredTxAction {
  return {
    txId,
    type: ActionTypes.REMOVE_STORED_TX,
  };
}

export function updateTransaction(
  walletId: Uuid,
  transaction: PersistentState.Transaction,
  meta: PersistentState.TxMeta | null,
): UpdateStoredTxAction {
  return {
    meta,
    transaction,
    walletId,
    type: ActionTypes.UPDATE_STORED_TX,
  };
}

export function getTransactionMeta(
  blockchain: BlockchainCode,
  txId: string,
): Dispatched<PersistentState.TxMeta | null> {
  return (dispatch, getState, extra) => extra.api.txMeta.get(blockchain, txId);
}

export function setTransactionMeta(meta: PersistentState.TxMeta): Dispatched<PersistentState.TxMeta> {
  return (dispatch, getState, extra) => extra.api.txMeta.set(meta);
}

export function setLastTxId(txId: string | null): LastTxIdAction {
  return {
    txId,
    type: ActionTypes.SET_LAST_TX_ID,
  };
}
