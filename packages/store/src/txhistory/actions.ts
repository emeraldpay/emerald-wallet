import { Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, PersistentState, TokenRegistry, blockchainIdToCode } from '@emeraldwallet/core';
import {
  ActionTypes,
  LastTxIdAction,
  LoadStoredTxsAction,
  RemoveStoredTxAction,
  StoredTransaction,
  UpdateStoredTxAction,
} from './types';
import { Dispatched } from '../types';

export function loadTransactions(walletId: Uuid, initial: boolean): Dispatched<void, LoadStoredTxsAction> {
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

        const tokenRegistry = new TokenRegistry(getState().application.tokens);

        return new StoredTransaction(tokenRegistry, tx, meta);
      }),
    );

    dispatch({
      type: ActionTypes.LOAD_STORED_TXS,
      walletId,
      cursor: page.cursor,
      transactions: transactions.filter((tx) => tx.changes.length > 0),
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
  meta: PersistentState.TxMetaItem | null,
): Dispatched<void, UpdateStoredTxAction> {
  return (dispatch, getState) => {
    const {
      application: { tokens },
    } = getState();

    dispatch({
      meta,
      tokens,
      transaction,
      walletId,
      type: ActionTypes.UPDATE_STORED_TX,
    });
  };
}

export function getTransactionMeta(
  blockchain: BlockchainCode,
  txId: string,
): Dispatched<PersistentState.TxMetaItem | null> {
  return (dispatch, getState, extra) => extra.api.txMeta.get(blockchain, txId);
}

export function setTransactionMeta(meta: PersistentState.TxMetaItem): Dispatched<PersistentState.TxMetaItem> {
  return (dispatch, getState, extra) => extra.api.txMeta.set(meta);
}

export function setLastTxId(txId: string | null): LastTxIdAction {
  return {
    txId,
    type: ActionTypes.SET_LAST_TX_ID,
  };
}
