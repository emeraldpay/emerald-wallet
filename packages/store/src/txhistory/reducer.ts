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
} from './types';

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

function onRemoveStoreTransaction(state: HistoryState, { txId }: RemoveStoredTxAction): HistoryState {
  return { ...state, transactions: state.transactions.filter((tx) => tx.txId !== txId) };
}

function onUpdateStoreTransaction(
  state: HistoryState,
  { meta, tokens, transaction, walletId }: UpdateStoredTxAction,
): HistoryState {
  if (state.walletId === walletId) {
    const tokenRegistry = new TokenRegistry(tokens);

    const storedTransaction = new StoredTransaction(tokenRegistry, transaction, meta);
    const storedTransactions = [...state.transactions];

    if (storedTransactions.length === 0) {
      return {
        ...state,
        transactions: [storedTransaction],
      };
    }

    const index = storedTransactions.findIndex((tx) => tx.txId === transaction.txId);

    if (index > -1) {
      if ((storedTransactions[index].version ?? 0) > (storedTransaction.version ?? 0)) {
        return state;
      }

      storedTransactions[index] = storedTransaction;

      return {
        ...state,
        transactions: storedTransactions,
      };
    }

    return {
      ...state,
      transactions: [storedTransaction, ...state.transactions].sort((first, second) => {
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
          return first.txId > second.txId ? -1 : 1;
        }

        return firstConfirmTimestamp > secondConfirmTimestamp ? -1 : 1;
      }),
    };
  }

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
    default:
      return state;
  }
}
