import {
  ActionTypes,
  HistoryAction,
  HistoryState,
  LastTxIdAction,
  LoadStoredTxsAction,
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

function onUpdateStoreTransaction(
  state: HistoryState,
  { meta, transaction, walletId }: UpdateStoredTxAction,
): HistoryState {
  if (state.walletId === walletId) {
    if (state.transactions.length < 10) {
      return {
        ...state,
        transactions: [...state.transactions, new StoredTransaction(transaction, meta)],
      };
    }

    const txIndex = state.transactions.findIndex((tx) => tx.txId === transaction.txId);

    if (txIndex > -1) {
      return {
        ...state,
        transactions: state.transactions.splice(txIndex, 1, new StoredTransaction(transaction, meta)),
      };
    }
  }

  return state;
}

export function reducer(state = INITIAL_STATE, action: HistoryAction): HistoryState {
  switch (action.type) {
    case ActionTypes.LOAD_STORED_TXS:
      return onLoadStoredTransactions(state, action);
    case ActionTypes.SET_LAST_TX_ID:
      return onSetLastTxId(state, action);
    case ActionTypes.UPDATE_STORED_TX:
      return onUpdateStoreTransaction(state, action);
    default:
      return state;
  }
}
