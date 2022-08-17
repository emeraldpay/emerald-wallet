import {
  ActionTypes,
  HistoryAction,
  HistoryState,
  LoadStoredTxsAction,
  StoredTransaction,
  UpdateStoredTxAction,
} from './types';

const INITIAL_STATE: HistoryState = {
  transactions: [],
};

function onLoadStoredTransactions(
  state: HistoryState,
  { cursor, transactions, walletId }: LoadStoredTxsAction,
): HistoryState {
  if (state.walletId === walletId) {
    return { ...state, cursor, transactions: [...state.transactions, ...transactions] };
  }

  return { ...state, cursor, transactions, walletId };
}

function onUpdateStoreTransaction(state: HistoryState, { transaction, walletId }: UpdateStoredTxAction): HistoryState {
  if (state.walletId !== walletId) {
    return state;
  }

  const txIndex = state.transactions.findIndex((tx) => tx.txId === transaction.txId);

  if (txIndex === -1) {
    return state;
  }

  return {
    ...state,
    transactions: state.transactions.splice(txIndex, 1, new StoredTransaction(transaction)),
  };
}

export function reducer(state = INITIAL_STATE, action: HistoryAction): HistoryState {
  switch (action.type) {
    case ActionTypes.LOAD_STORED_TXS:
      return onLoadStoredTransactions(state, action);
    case ActionTypes.UPDATE_STORED_TX:
      return onUpdateStoreTransaction(state, action);
    default:
      return state;
  }
}
