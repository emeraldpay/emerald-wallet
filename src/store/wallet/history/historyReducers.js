import { fromJS, Map } from 'immutable';
import { convert } from 'emerald-js';

import ActionTypes from './actionTypes';

const { toNumber, toBigNumber } = convert;

const initial = fromJS({
  trackedTransactions: [],
  chainId: null,
});

const initialTx = Map({
  hash: null,
  blockNumber: null,
  timestamp: null,
  from: null,
  to: null,
  value: null,
  data: null,
  gas: null,
  gasPrice: null,
  nonce: null,
});

function isTracked(state, tx) {
  return state.get('trackedTransactions').some((x) => tx.get('hash') === x.get('hash'));
}

function createTx(data) {
  let tx = initialTx.merge({
    hash: data.hash,
    to: data.to,
  });
  if (data.from !== '0x0000000000000000000000000000000000000000') {
    tx = tx.set('from', data.from);
  }
  tx = tx.set('value', toBigNumber(data.value));
  tx = tx.set('gasPrice', toBigNumber(data.gasPrice));
  tx = tx.set('gas', toBigNumber(data.gas).toNumber());
  tx = tx.set('nonce', toBigNumber(data.nonce).toNumber());

  // If is not pending, fill in finalized attributes.
  if (typeof data.blockNumber !== 'undefined' && data.blockNumber !== null) {
    tx = tx.merge({
      blockHash: data.blockHash,
      blockNumber: data.blockNumber,
      nonce: toNumber(data.nonce),
      replayProtected: data.replayProtected,
      // This is due to great inconsistency in original Eth API (sometimes data, sometimes input)
      data: (data.data || data.input),
    });
  }
  return tx;
}

function onTrackTx(state, action) {
  if (action.type === ActionTypes.TRACK_TX) {
    const data = createTx(action.tx);
    if (isTracked(state, data)) {
      return state;
    }
    return state.update('trackedTransactions', (txs) => txs.push(data));
  }
  return state;
}

function onLoadStoredTransactions(state, action) {
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
function onTrackedTxNotFound(state, action) {
  if (action.type === ActionTypes.TRACKED_TX_NOTFOUND) {
    return state.update('trackedTransactions', (txes) => {
      const pos = txes.findKey((tx) => tx.get('hash') === action.hash);
      if (pos >= 0) {
        // increase total retries counter
        txes = txes.update(pos, (tx) => tx.set('totalRetries', (tx.get('totalRetries') || 0) + 1));
      }
      return txes;
    });
  }
  return state;
}

function onUpdateTx(state, action) {
  if (action.type === ActionTypes.UPDATE_TX) {
    return state.update('trackedTransactions', (txs) => {
      const pos = txs.findKey((tx) => tx.get('hash') === action.tx.hash);
      if (pos >= 0) {
        txs = txs.update(pos, (tx) => tx.mergeWith((o, n) => n, createTx(action.tx)));
      }
      return txs;
    });
  }
  return state;
}

function onPendingTx(state, action) {
  if (action.type === ActionTypes.PENDING_TX) {
    let txes = state.get('trackedTransactions');
    for (const tx of action.txList) {
      // In case of dupe pending txs.
      const pos = txes.findKey((Tx) => Tx.get('hash') === tx.hash);
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

function onChainChanged(state, action) {
  if (action.type === ActionTypes.CHAIN_CHANGED) {
    return state
      .set('chainId', action.chainId)
      .set('trackedTransactions', fromJS([]));
  }
  return state;
}

export default function historyReducers(state, action) {
  state = state || initial;
  state = onTrackTx(state, action);
  state = onLoadStoredTransactions(state, action);
  state = onTrackedTxNotFound(state, action);
  state = onUpdateTx(state, action);
  state = onPendingTx(state, action);
  state = onChainChanged(state, action);
  return state;
}
