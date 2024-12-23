import { TokenRegistry } from '@emeraldwallet/core';
import {
  ActionTypes,
  HistoryAction,
  HistoryState,
  LastTxIdAction,
  LoadStoredTxsAction,
  RemoveStoredTxAction,
  StoredTransaction,
  UpdateStoredTxAction,
  UpdateTxTokensAction,
} from './types';
import {isBlockchainId} from "@emeraldwallet/core";

const INITIAL_STATE: HistoryState = {
  lastTxId: null,
  transactions: [],
};

function onLoadStoredTransactions(
  state: HistoryState,
  { cursor, transactions, walletId }: LoadStoredTxsAction,
): HistoryState {
  if (state.walletId === walletId) {
    return { ...state, cursor, transactions: [...state.transactions, ...transactions] };
  }

  return { ...state, cursor, transactions, walletId, lastTxId: null };
}

function onSetLastTxId(state: HistoryState, { txId }: LastTxIdAction): HistoryState {
  return { ...state, lastTxId: txId };
}

function onRemoveStoreTransaction(state: HistoryState, { txIds }: RemoveStoredTxAction): HistoryState {
  return { ...state, transactions: state.transactions
      .filter((tx) => tx.txId !in txIds) };
}

function onUpdateStoreTransaction(
  state: HistoryState,
  { tokens, transactions, walletId }: UpdateStoredTxAction,
): HistoryState {
  const tokenRegistry = new TokenRegistry(tokens.filter((token) => isBlockchainId(token.blockchain)));
  const updatedTransactions = [];
  if (state.walletId === walletId) {
    for (const prevTransaction of state.transactions) {
      const update = transactions.find((tx) => tx.transaction.txId === prevTransaction.txId);
      if (update) {
        const storedTransaction = new StoredTransaction(tokenRegistry, update.transaction, update.meta);
        if ((prevTransaction.version ?? 0) > (storedTransaction.version ?? 0)) {
          updatedTransactions.push(prevTransaction);
        } else {
          updatedTransactions.push(storedTransaction);
        }
      } else {
        updatedTransactions.push(prevTransaction);
      }
    }

    for (const tx of transactions) {
      if (!state.transactions.find((prev) => prev.txId === tx.transaction.txId)) {
        updatedTransactions.push(new StoredTransaction(tokenRegistry, tx.transaction, tx.meta));
      }
    }

    return {
      ...state,
      transactions: updatedTransactions.sort((first, second) => {
        const { confirmTimestamp: firstConfirmTimestamp } = first;
        const { confirmTimestamp: secondConfirmTimestamp } = second;

        const firstInMempool = firstConfirmTimestamp == null;
        const secondInMempool = secondConfirmTimestamp == null;

        if (firstInMempool && secondInMempool) {
          if (first.sinceTimestamp === second.sinceTimestamp) {
            return first.txId > second.txId ? -1 : 1;
          }

          return first.sinceTimestamp > second.sinceTimestamp ? -1 : 1;
        }

        if (firstInMempool) {
          return -1;
        }

        if (secondInMempool) {
          return 1;
        }

        if (firstConfirmTimestamp === secondConfirmTimestamp) {
          if (first.blockPos == null || second.blockPos == null || first.block?.blockId !== second.block?.blockId) {
            return first.txId > second.txId ? -1 : 1;
          }

          return first.blockPos > second.blockPos ? -1 : 1;
        }

        return firstConfirmTimestamp > secondConfirmTimestamp ? -1 : 1;
      }),
    };
  }

  return state;
}

function onUpdateTransactionTokens(state: HistoryState, { tokens }: UpdateTxTokensAction): HistoryState {
  const tokenRegistry = new TokenRegistry(tokens);

  state.transactions.forEach((transaction) => (transaction.tokenRegistry = tokenRegistry));

  return state;
}

export function reducer(state = INITIAL_STATE, action: HistoryAction): HistoryState {
  switch (action.type) {
    case ActionTypes.LOAD_STORED_TXS:
      return onLoadStoredTransactions(state, action);
    case ActionTypes.SET_LAST_TX_ID:
      return onSetLastTxId(state, action);
    case ActionTypes.REMOVE_STORED_TX:
      return onRemoveStoreTransaction(state, action);
    case ActionTypes.UPDATE_STORED_TX:
      return onUpdateStoreTransaction(state, action);
    case ActionTypes.UPDATE_TX_TOKENS:
      return onUpdateTransactionTokens(state, action);
    default:
      return state;
  }
}
