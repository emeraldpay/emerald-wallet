import { ActionTypes, HistoryAction, HistoryState, LoadStoredTxsAction } from './types';

const INITIAL_STATE: HistoryState = {
  transactions: [],
};

function onLoadStoredTransactions(state: HistoryState, { transactions, walletId }: LoadStoredTxsAction): HistoryState {
  return { ...state, transactions, walletId };
}

export function reducer(state = INITIAL_STATE, action: HistoryAction): HistoryState {
  switch (action.type) {
    case ActionTypes.LOAD_STORED_TXS:
      return onLoadStoredTransactions(state, action);
    default:
      return state;
  }
}
