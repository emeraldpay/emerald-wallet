import {
  ActionTypes,
  HistoryAction,
  HistoryState,
  LoadStoredTxsAction,
  TrackTxsAction,
  UpdateTxsAction,
} from './types';

const INITIAL_STATE: HistoryState = {
  transactions: new Map(),
};

function onLoadStoredTransactions(state: HistoryState, action: LoadStoredTxsAction): HistoryState {
  return {
    ...state,
    transactions: action.transactions.reduce(
      (carry, transaction) => carry.set(transaction.txId, transaction),
      new Map(),
    ),
    walletId: action.walletId,
  };
}

function onTrackTxs(state: HistoryState, action: TrackTxsAction): HistoryState {
  // if (action.type === ActionTypes.TRACK_TXS) {
  //   const transactions = action.txs.map(createTx);
  //   return state.update('trackedTransactions', (trackedTransactions: any) => {
  //     transactions.forEach((tx) => {
  //       if (!isTracked(state, tx)) {
  //         trackedTransactions = trackedTransactions.push(tx);
  //       }
  //     });
  //
  //     return trackedTransactions;
  //   });
  // }
  return state;
}

function onUpdateTxs(state: HistoryState, action: UpdateTxsAction): HistoryState {
  // if (action.type === ActionTypes.UPDATE_TXS) {
  //   return state.update('trackedTransactions', (txs: any) => {
  //     action.payload.forEach((received) => {
  //       const pos = txs.findKey((tx: any) => tx.get('hash') === received.hash);
  //       if (pos >= 0) {
  //         const orig = txs.get(pos);
  //         const created = createTx(received);
  //         txs = txs.update(pos, (tx: any) =>
  //           tx
  //             .mergeWith((oldValue: any, newValue: any) => newValue || oldValue, created)
  //             .set('since', mergeSince(tx, created))
  //             .update(updateStatus),
  //         );
  //       }
  //     });
  //     return txs;
  //   });
  // }
  return state;
}

export function reducer(state = INITIAL_STATE, action: HistoryAction): HistoryState {
  switch (action.type) {
    case ActionTypes.LOAD_STORED_TXS:
      return onLoadStoredTransactions(state, action);
    case ActionTypes.TRACK_TXS:
      return onTrackTxs(state, action);
    case ActionTypes.UPDATE_TXS:
      return onUpdateTxs(state, action);
    default:
      return state;
  }
}
