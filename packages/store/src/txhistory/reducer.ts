import { ActionTypes, HistoryAction, HistoryState, LoadStoredTxsAction, UpdateStoredTxAction } from './types';

const INITIAL_STATE: HistoryState = {
  transactions: [],
};

function onLoadStoredTransactions(state: HistoryState, { transactions, walletId }: LoadStoredTxsAction): HistoryState {
  return { ...state, transactions, walletId };
}

function onUpdateStoreTransaction(state: HistoryState, { transaction }: UpdateStoredTxAction): HistoryState {
  const txIndex = state.transactions.findIndex((tx) => tx.txId === transaction.txId);

  return {
    ...state,
    transactions:
      txIndex > -1 ? state.transactions.splice(txIndex, 1, transaction) : [...state.transactions, transaction],
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
