import Immutable from 'immutable';
import { convert } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';

import ActionTypes from './actionTypes';

const { toNumber } = convert;

const initial = Immutable.fromJS({
  gasPrice: new Wei(23000000000),
});

function onGasPrice(state, action) {
  if (action.type === ActionTypes.GAS_PRICE) {
    return state.set('gasPrice', new Wei(action.value));
  }
  return state;
}

export default function networkReducers(state, action) {
  state = state || initial;
  state = onGasPrice(state, action);
  return state;
}
