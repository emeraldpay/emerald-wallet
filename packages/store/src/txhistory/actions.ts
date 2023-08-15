import { Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, PersistentState, TokenData, TokenRegistry, blockchainIdToCode } from '@emeraldwallet/core';
import { accounts } from '../index';
import { Dispatched } from '../types';
import {
  ActionTypes,
  LastTxIdAction,
  LoadStoredTxsAction,
  RemoveStoredTxAction,
  StoredTransaction,
  UpdateStoredTxAction,
  UpdateTxTokensAction,
} from './types';

export function loadTransactions(walletId: Uuid, initial: boolean, limit = 20): Dispatched<void, LoadStoredTxsAction> {
  return async (dispatch, getState, extra) => {
    const state = getState();

    const { application, history } = state;

    if (walletId === history.walletId && (initial || history.cursor === null)) {
      return;
    }

    let walletCursor = history.cursor;

    if (walletId !== history.walletId) {
      walletCursor = undefined;
    }

    const page: PersistentState.PageResult<PersistentState.Transaction> = await extra.api.txHistory.query(
      { wallet: walletId },
      { limit, cursor: walletCursor },
    );

    const storedTransactions = await Promise.all(
      page.items.map(async (tx) => {
        const meta = await extra.api.txMeta.get(blockchainIdToCode(tx.blockchain), tx.txId);

        const tokenRegistry = new TokenRegistry(application.tokens);

        return new StoredTransaction(tokenRegistry, tx, meta);
      }),
    );

    const addresses =
      accounts.selectors
        .findWallet(state, walletId)
        ?.entries.map(({ address }) => address?.value)
        .filter((address): address is string => address != null) ?? [];

    const transactions = storedTransactions.filter(
      ({ changes }) =>
        changes.filter(({ address, type }) => {
          if (address != null && type === PersistentState.ChangeType.FEE) {
            return addresses.includes(address);
          }

          return true;
        }).length > 0,
    );

    dispatch({
      transactions,
      walletId,
      cursor: page.cursor,
      type: ActionTypes.LOAD_STORED_TXS,
    });

    const missingCount = transactions.length - limit;

    if (missingCount > 0) {
      loadTransactions(walletId, initial, missingCount);
    }
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

export function updateTransactionTokens(tokens: TokenData[]): UpdateTxTokensAction {
  return { type: ActionTypes.UPDATE_TX_TOKENS, tokens };
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
