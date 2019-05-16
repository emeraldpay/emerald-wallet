import Immutable from 'immutable';
import { convert } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';

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
  gasPrice: new Wei(23000000000),
});

function onHeight(state, action) {
  if (action.type === ActionTypes.BLOCK) {
    return state.update('currentBlock', (b) => b.set('height', toNumber(action.height))
      .set('hash', null));
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
  state = onHeight(state, action);
  state = onSwitchChain(state, action);
  state = onGasPrice(state, action);
  return state;
}
