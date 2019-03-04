import Immutable from 'immutable';
import { convert } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/emerald-js';

import ActionTypes from './actionTypes';

const { toNumber } = convert;

const initial = Immutable.fromJS({
  chain: {
    name: null,
    id: null,
  },
  currentBlock: {
    height: 0,
    hash: null,
  },
  sync: {
    syncing: false,
    startingBlock: null,
    currentBlock: null,
    highestBlock: null,
  },
  peerCount: 0,
  gasPrice: new Wei(23000000000),
});

function onSyncing(state, action) {
  if (action.type === ActionTypes.SYNCING) {
    if (action.syncing) {
      return state.update('sync', (sync) => sync.set('syncing', true)
        .set('startingBlock', toNumber(action.status.startingBlock))
        .set('currentBlock', toNumber(action.status.currentBlock))
        .set('highestBlock', toNumber(action.status.highestBlock))).update('currentBlock', (b) => b.set('height', toNumber(action.status.currentBlock))
        .set('hash', null));
    }
    return state.setIn(['sync', 'syncing'], false);
  }
  return state;
}

function onHeight(state, action) {
  if (action.type === ActionTypes.BLOCK) {
    return state.update('currentBlock', (b) => b.set('height', toNumber(action.height))
      .set('hash', null));
  }
  return state;
}

function onPeerCount(state, action) {
  if (action.type === ActionTypes.PEER_COUNT) {
    return state.set('peerCount', toNumber(action.peerCount));
  }
  return state;
}

function onSwitchChain(state, action) {
  if (action.type === ActionTypes.SWITCH_CHAIN) {
    const chain = {
      name: action.chain,
      id: action.chainId,
    };
    return initial.update('chain', (c) => c.merge(Immutable.fromJS(chain)));
  }
  return state;
}


function onGasPrice(state, action) {
  if (action.type === ActionTypes.GAS_PRICE) {
    return state.set('gasPrice', new Wei(action.value));
  }
  return state;
}

export default function networkReducers(state, action) {
  state = state || initial;
  state = onSyncing(state, action);
  state = onHeight(state, action);
  state = onPeerCount(state, action);
  state = onSwitchChain(state, action);
  state = onGasPrice(state, action);
  return state;
}
