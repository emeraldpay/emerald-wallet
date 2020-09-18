import { convert } from '@emeraldplatform/core';
import { IStoredTransaction, utils } from '@emeraldwallet/core';
import { fromJS, Map } from 'immutable';
import {
  ActionTypes,
  HistoryAction,
  ILoadStoredTxsAction,
  IPendingTxAction,
  ITrackedTxNotFoundAction,
  ITrackTxAction,
  ITrackTxsAction,
  IUpdateTxsAction
} from './types';

const { toNumber, toBigNumber } = convert;

export const INITIAL_STATE = fromJS({
  trackedTransactions: []
});

const initialTx = Map({
  blockNumber: null,
  timestamp: null,
  from: null,
  value: null,
  data: null,
  gas: null,
  gasPrice: null,
  nonce: null
});

function isTracked (state: any, tx: any) {
  return state.get('trackedTransactions').some((x: any) => tx.get('hash') === x.get('hash'));
}

/**
 * Returns earliest known date from the specified transactions
 *
 * @param a
 * @param b
 */
function mergeSince (a: any, b: any): Date {
  const dates: number[] = [new Date().getTime()];
  ['since', 'timestamp'].forEach((field) => {
    [a, b].forEach((tx) => {
      const value = tx.get(field);
      const date = utils.parseDate(value);
      if (typeof date !== 'undefined') {
        dates.push(date.getTime());
      }
    });
  });
  return new Date(Math.min(...dates));
}

/**
 * Updates `discarded` status for the provided transaction
 *
 * @param tx
 * @return same tx with recalculated `discarded` field
 */
function updateStatus (tx: any): any {
  if (typeof tx.get('blockNumber') === 'number') {
    return tx.set('discarded', false);
  } else if (tx.get('broadcasted')) {
    return tx.set('discarded', false);
  } else if (typeof tx.get('since') !== 'undefined') {
    const since = tx.get('since');
    const hourAgo = new Date().getTime() - 60 * 60 * 1000;
    return tx.set('discarded', since.getTime() < hourAgo);
  } else {
    return tx.set('discarded', false);
  }
}

function createTx (data: IStoredTransaction) {
  const values: { [key: string]: any } = {
    hash: data.hash,
    to: data.to
  };
  let tx: Map<string, any> = initialTx.merge(values);
  if (data.from !== '0x0000000000000000000000000000000000000000') {
    tx = tx.set('from', data.from);
  }
  tx = tx.set('value', data.value ? data.value.toString() : data.value);
  tx = tx.set('gasPrice', data.gasPrice ? data.gasPrice.toString() : data.gasPrice);
  tx = tx.set('gas', data.gas ? toBigNumber(data.gas).toNumber() : data.gas);
  tx = tx.set('nonce', data.nonce ? toBigNumber(data.nonce).toNumber() : data.nonce);
  tx = tx.set('timestamp', utils.parseDate(data.timestamp));
  tx = tx.set('since', utils.parseDate(data.since));
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
      discarded: false
    });
  } else if (typeof data.broadcasted !== 'undefined' && data.broadcasted) {
    tx = tx.set('broadcasted', true)
          .set('discarded', false);
  }

  return tx;
}

function onTrackTxs (state: any, action: ITrackTxsAction) {
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

function onTrackTx (state: any, action: ITrackTxAction): any {
  if (action.type === ActionTypes.TRACK_TX) {
    const data = createTx(action.tx);
    if (isTracked(state, data)) {
      return state;
    }
    return state.update('trackedTransactions', (txs: any) => txs.push(data));
  }
  return state;
}

function onPendingTx (state: any, action: IPendingTxAction): any {
  if (action.type === ActionTypes.PENDING_TX) {
    let txes = state.get('trackedTransactions');
    for (const tx of action.txList) {
      // In case of dupe pending txs.
      const pos = txes.findKey((Tx: any) => Tx.get('hash') === tx.hash);
      txes = pos >= 0 ? txes.set(pos, createTx(tx)) : txes.push(createTx(tx));
    }
    return state.set('trackedTransactions', fromJS(txes));
  }
  return state;
}

function onLoadStoredTransactions (state: any, action: ILoadStoredTxsAction) {
  if (action.type === ActionTypes.LOAD_STORED_TXS) {
    let txs = fromJS([]);
    for (const tx of action.transactions) {
      txs = txs.push(createTx(tx).update(updateStatus));
    }
    return state.set('trackedTransactions', fromJS(txs));
  }
  return state;
}

/**
 * When full node can't find our tx
 */
function onTrackedTxNotFound (state: any, action: ITrackedTxNotFoundAction) {
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

function onUpdateTxs (state: any, action: IUpdateTxsAction) {
  if (action.type === ActionTypes.UPDATE_TXS) {
    return state.update('trackedTransactions', (txs: any) => {
      action.payload.forEach((received) => {
        const pos = txs.findKey((tx: any) => tx.get('hash') === received.hash);
        if (pos >= 0) {
          const orig = txs.get(pos);
          const created = createTx(received);
          txs = txs.update(pos, (tx: any) =>
            tx.mergeWith((oldValue: any, newValue: any) => newValue || oldValue, created)
              .set('since', mergeSince(tx, created))
              .update(updateStatus)
          );
        }
      });
      return txs;
    });
  }
  return state;
}

export function reducer (
  state: any = INITIAL_STATE,
  action: HistoryAction
): any {
  switch (action.type) {
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
