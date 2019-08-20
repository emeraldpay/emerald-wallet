import { fromJS, Map } from 'immutable';
import { convert } from '@emeraldplatform/core';

import {
  ActionTypes,
  HistoryAction,
  LoadStoredTxsAction,
  PendingTxAction,
  TrackedTxNotFoundAction,
  TrackTxAction,
  TrackTxsAction,
  UpdateTxsAction,
} from './types';
import {Transaction} from "../types";

const { toNumber, toBigNumber } = convert;

const initial = fromJS({
  trackedTransactions: [],
  chainId: null,
});

const initialTx = Map({
  blockNumber: null,
  timestamp: null,
  from: null,
  value: null,
  data: null,
  gas: null,
  gasPrice: null,
  nonce: null,
});

function isTracked(state: any, tx: any) {
  return state.get('trackedTransactions').some((x: any) => tx.get('hash') === x.get('hash'));
}

function createTx(data: Transaction) {
  const values: {[key: string]: any} = {
    hash: data.hash,
    to: data.to,
  };
  let tx: Map<string, any> = initialTx.merge(values);
  if (data.from !== '0x0000000000000000000000000000000000000000') {
    tx = tx.set('from', data.from);
  }
  tx = tx.set('value', data.value ? toBigNumber(data.value) : data.value);
  tx = tx.set('gasPrice', data.gasPrice ? toBigNumber(data.gasPrice) : data.gasPrice);
  tx = tx.set('gas', data.gas ? toBigNumber(data.gas).toNumber() : data.gas);
  tx = tx.set('nonce', data.nonce ? toBigNumber(data.nonce).toNumber() : data.nonce);
  tx = tx.set('timestamp', data.timestamp);
  tx = tx.set('chainId', data.chainId);
  tx = tx.set('blockchain', data.blockchain);
  if (data.nonce) {
    tx = tx.set('nonce', toNumber(data.nonce));
  }
  if (typeof data.replayProtected !== 'undefined') {
    tx = tx.set('replayProtected', data.replayProtected);
  }
  if (data.data || data.input) {
    // This is due to great inconsistency in original Eth API (sometimes data, sometimes input)
    tx = tx.set('data', data.data || data.input);
  }

  // If is not pending, fill in finalized attributes.
  if (typeof data.blockNumber !== 'undefined' && data.blockNumber !== null) {
    tx = tx.merge({
      blockHash: data.blockHash,
      blockNumber: toNumber(data.blockNumber),
    });
  }

  return tx;
}

function onTrackTxs(state: any, action: TrackTxsAction) {
  if (action.type === ActionTypes.TRACK_TXS) {
    const transactions = action.txs.map(createTx);
    return state.update('trackedTransactions', (trackedTransactions: any) => {
      transactions.forEach((tx) => {
        if (!isTracked(state, tx)) {
          trackedTransactions = trackedTransactions.push(tx);
        }
      });

      return trackedTransactions;
    });
  }
  return state;
}

function onTrackTx(state: any, action: TrackTxAction): any {
  if (action.type === ActionTypes.TRACK_TX) {
    const data = createTx(action.tx);
    if (isTracked(state, data)) {
      return state;
    }
    return state.update('trackedTransactions', (txs: any) => txs.push(data));
  }
  return state;
}

function onPendingTx(state: any, action: PendingTxAction): any {
  if (action.type === ActionTypes.PENDING_TX) {
    let txes = state.get('trackedTransactions');
    for (const tx of action.txList) {
      // In case of dupe pending txs.
      const pos = txes.findKey((Tx: any) => Tx.get('hash') === tx.hash);
      if (pos >= 0) {
        txes = txes.set(pos, createTx(tx));
      } else {
        txes = txes.push(createTx(tx));
      }
    }
    return state.set('trackedTransactions', fromJS(txes));
  }
  return state;
}

function onLoadStoredTransactions(state: any, action: LoadStoredTxsAction) {
  if (action.type === ActionTypes.LOAD_STORED_TXS) {
    let txs = fromJS([]);
    for (const tx of action.transactions) {
      txs = txs.push(createTx(tx));
    }
    return state.set('trackedTransactions', fromJS(txs));
  }
  return state;
}

/**
 * When full node can't find our tx
 */
function onTrackedTxNotFound(state: any, action: TrackedTxNotFoundAction) {
  if (action.type === ActionTypes.TRACKED_TX_NOTFOUND) {
    return state.update('trackedTransactions', (txes: any) => {
      const pos = txes.findKey((tx: any) => tx.get('hash') === action.hash);
      if (pos >= 0) {
        // increase total retries counter
        txes = txes.update(pos, (tx: any) => tx.set('totalRetries', (tx.get('totalRetries') || 0) + 1));
      }
      return txes;
    });
  }
  return state;
}

function onUpdateTxs(state: any, action: UpdateTxsAction) {
  if (action.type === ActionTypes.UPDATE_TXS) {
    return state.update('trackedTransactions', (txs: any) => {
      action.payload.forEach((t) => {
        const pos = txs.findKey((tx: any) => tx.get('hash') === t.hash);
        if (pos >= 0) {
          txs = txs.update(pos, (tx: any) => tx.mergeWith((o: any, n: any) => n || o, createTx(t)));
        }
      });
      return txs;
    });
  }
  return state;
}

export function reducer(
  state: any,
  action: HistoryAction | null
): any {
  if (!state) {
    state = initial;
  }
  if (!action) {
    return state;
  }
  switch(action.type) {
    case ActionTypes.TRACK_TX:
      return onTrackTx(state, action);
    case ActionTypes.TRACK_TXS:
      return onTrackTxs(state, action);
    case ActionTypes.LOAD_STORED_TXS:
      return onLoadStoredTransactions(state, action);
    case ActionTypes.TRACKED_TX_NOTFOUND:
      return onTrackedTxNotFound(state, action);
    case ActionTypes.UPDATE_TXS:
      return onUpdateTxs(state, action);
    case ActionTypes.PENDING_TX:
      return onPendingTx(state, action);
  }
  return state;
}
