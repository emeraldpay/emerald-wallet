import { convert } from '@emeraldplatform/core';
import { BlockchainCode, IStoredTransaction } from '@emeraldwallet/core';
import { loadTransactions, storeTransactions } from '@emeraldwallet/history-store';
import BigNumber from 'bignumber.js';
import { fromJS, List } from 'immutable';
import { reducer as historyReducers } from './reducer';
import { ActionTypes, IUpdateTxsAction } from './types';

const { toBigNumber } = convert;

describe('historyReducer', () => {
  it('should store and load txs correctly', () => {
    // prepare
    let state = historyReducers(null, null);
    expect(state.get('trackedTransactions')).toEqual(List());
    state = historyReducers(state, {
      type: ActionTypes.TRACK_TX,
      tx: {
        hash: 'hash1',
        value: toBigNumber('0x1'),
        gas: '0x47e7c4',
        gasPrice: '0x174876e800',
        nonce: '0x4',
        from: '0x0',
        to: '0x1',
        blockchain: BlockchainCode.Kovan,
        chainId: 62
      }
    });
    expect(state.get('trackedTransactions').size).toBe(1);

    storeTransactions('k', state.get('trackedTransactions').toJS());
    const loaded = loadTransactions('k', 62);

    // load restored txs to state
    state = historyReducers(state, {
      type: ActionTypes.LOAD_STORED_TXS,
      transactions: loaded
    });

    expect(state.get('trackedTransactions').size).toBe(1);
    const tx = state.get('trackedTransactions').first().toJS();
    expect(tx.value).toEqual(new BigNumber(1));
  });

  it('should add pending TX or update existent', () => {
    let state = historyReducers(null, null);
    expect(state.get('trackedTransactions')).toEqual(List());
    state = historyReducers(state, {
      type: ActionTypes.TRACK_TX,
      tx: {
        value: toBigNumber('0x0'),
        hash: 'hash1',
        gas: '0x47e7c4',
        gasPrice: '0x174876e800',
        nonce: '0x4',
        from: '0x0',
        to: '0x0',
        blockchain: BlockchainCode.Kovan
      }
    });
    expect(state.get('trackedTransactions').size).toBe(1);

    state = historyReducers(state, {
      type: ActionTypes.PENDING_TX,
      txList: [
        {
          value: toBigNumber('0x0'),
          hash: 'hash1',
          gas: '0x47e7c4',
          gasPrice: '0x174876e800',
          nonce: '0x4',
          from: '0x0',
          to: '0x0',
          blockchain: BlockchainCode.Kovan
        },
        {
          value: toBigNumber('0x0'),
          hash: 'hash2',
          gas: '0x47e7c4',
          gasPrice: '0x174876e800',
          nonce: '0x4',
          from: '0x0',
          to: '0x0',
          blockchain: BlockchainCode.Kovan

        }
      ]
    });
    expect(state.get('trackedTransactions').size).toBe(2);
  });

  it('should update TXS data with tx.input', () => {
    const tx: IStoredTransaction = {
      blockHash: '0xc87e5117923e756e5d262ef230374b73ebe47f232b0f029fa65cf6614d959100',
      blockNumber: '0x17',
      from: '0x0178537bb1d7bb412101cdb7389c28fd4cf5ac0a',
      gas: '0x47e7c4',
      gasPrice: '0x174876e800',
      hash: '0x42a46d800b7c5b230ccf5aaa98d1726cad3d621eda0a67fa364322ad3b1d9adc',
      nonce: '0x4',
      to: '0x0d5fa90814e60f2a6cb7bad13d150ba0640d08b9',
      // @ts-ignore
      transactionIndex: '0x0',
      value: toBigNumber('0x12'),
      input: 'fckef'
    };

    // prepare state
    let state = historyReducers(null, {
      type: ActionTypes.TRACK_TX,
      tx: {
        hash: tx.hash,
        gas: '0x47e7c4',
        gasPrice: '0x174876e800',
        nonce: '0x4',
        value: toBigNumber('0x4'),
        from: '0x0',
        to: '0x0',
        blockchain: BlockchainCode.Kovan
      }
    });

    // action
    const action: IUpdateTxsAction = {
      type: ActionTypes.UPDATE_TXS,
      payload: [tx]
    };
    state = historyReducers(state, action);
    const trackedTxs = state.get('trackedTransactions').last().toJS();
    // This is inconsistency in ethereum api
    expect(trackedTxs.data).toEqual(tx.input);
    expect(trackedTxs.hash).toEqual(tx.hash);
    expect(trackedTxs.value.comparedTo(tx.value)).toEqual(0);
  });

  it('should update TXS timestamp', () => {
    const tx = {
      blockHash: '0xc87e5117923e756e5d262ef230374b73ebe47f232b0f029fa65cf6614d959100',
      blockNumber: '0x17',
      from: '0x0178537bb1d7bb412101cdb7389c28fd4cf5ac0a',
      gas: '0x47e7c4',
      gasPrice: '0x174876e800',
      hash: '0x42a46d800b7c5b230ccf5aaa98d1726cad3d621eda0a67fa364322ad3b1d9adc',
      nonce: '0x4',
      to: '0x0d5fa90814e60f2a6cb7bad13d150ba0640d08b9',
      transactionIndex: '0x0',
      value: toBigNumber('0x12'),
      input: 'fckef',
      blockchain: BlockchainCode.Kovan
    };

    // prepare state
    let state = historyReducers(fromJS({
      trackedTransactions: List.of()
    }), {
      type: ActionTypes.TRACK_TX,
      tx
    });

    const now = new Date();

    // action
    const action: IUpdateTxsAction = {
      type: ActionTypes.UPDATE_TXS,
      payload: [
        {
          hash: tx.hash,
          timestamp: now,
          value: toBigNumber('0x12'),
          gas: '0x0',
          gasPrice: '0x0',
          from: '0x0',
          to: '0x0',
          nonce: 0,
          blockchain: BlockchainCode.Kovan
        }]
    };

    state = historyReducers(state, action);
    const trackedTxs = state.get('trackedTransactions').last().toJS();
    expect(trackedTxs.timestamp).toEqual(now);
    expect(trackedTxs.value.comparedTo(tx.value)).toEqual(0);
  });

  it('should handle UPDATE_TXS', () => {
    // prepare

    const txs: IStoredTransaction[] = [{
      blockHash: '0xc87e5117923e756e5d262ef230374b73ebe47f232b0f029fa65cf6614d959100',
      blockNumber: '0x17',
      from: '0x0178537bb1d7bb412101cdb7389c28fd4cf5ac0a',
      gas: '0x47e7c4',
      gasPrice: '0x174876e800',
      hash: '0x42a46d800b7c5b230ccf5aaa98d1726cad3d621eda0a67fa364322ad3b1d9adc',
      nonce: '0x4',
      to: '0x0d5fa90814e60f2a6cb7bad13d150ba0640d08b9',
      // @ts-ignore
      transactionIndex: '0x0',
      value: toBigNumber('0x12'),
      input: 'fckef'
    },
      {
        blockHash: '0xc87e5117923e756e5d262ef230374b73ebe47f232b0f029fa65cf6614d959100',
        blockNumber: '0x17',
        from: '0x0178537bb1d7bb412101cdb7389c28fd4cf5ac0a',
        gas: '0x47e7c4',
        gasPrice: '0x174876e800',
        hash: '0x42a46d800b7c5b230ccf5aaa98d1726cad3d621eda0a67fa364322ad3b1d9add',
        nonce: '0x4',
        to: '0x0d5fa90814e60f2a6cb7bad13d150ba0640d08b9',
        // @ts-ignore
        transactionIndex: '0x0',
        value: toBigNumber('0x12'),
        input: 'fckef'
      }];

    let state = historyReducers(null, {
      type: ActionTypes.TRACK_TX,
      tx: txs[0]
    });

    state = historyReducers(state, {
      type: ActionTypes.TRACK_TX,
      tx: txs[1]
    });

    // do
    state = historyReducers(state, {
      type: ActionTypes.UPDATE_TXS,
      payload: txs
    });

    // assert
    expect(state.get('trackedTransactions').count()).toEqual(2);
  });
});
