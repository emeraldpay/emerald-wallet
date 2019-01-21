import Immutable from 'immutable';
import { convert } from '@emeraldplatform/emerald-js';
import TokenUnits from '../../lib/tokenUnits';
import ActionTypes from './actionTypes';

const initialState = Immutable.fromJS({
  connected: false,
  watch: false,
  hd: {
    base: "m/44'/60'/160720'/0'",
    offset: 0,
  },
  addresses: [],
  selectedAddr: null,
});

const initialAccount = Immutable.fromJS({
  hdpath: null,
  address: null,
  value: null,
  txcount: 0,
});

function updateHd(state, hd, f) {
  return state.update('addresses', (list) => {
    const pos = list.findKey((a) => a.get('hdpath') === hd);
    if (pos >= 0) {
      return list.update(pos, f);
    }
    return list;
  });
}

function onGetAddress(state, action) {
  if (action.type === ActionTypes.ADDR) {
    return updateHd(state, action.hdpath, (addr) => addr.set('address', action.addr));
  }
  return state;
}

function onSetBalance(state, action) {
  if (action.type === ActionTypes.ADDR_BALANCE) {
    return updateHd(state, action.hdpath, (addr) =>
      addr.set('value', new TokenUnits(convert.toBigNumber(action.value), 18))
    );
  }
  return state;
}
function onSetTxCount(state, action) {
  if (action.type === ActionTypes.ADDR_TXCOUNT) {
    return updateHd(state, action.hdpath, (addr) =>
      addr.set('txcount', action.value)
    );
  }
  return state;
}

function onSetPath(state, action) {
  if (action.type === ActionTypes.SET_LIST_HDPATH) {
    return state.update('addresses', (list) =>
      list.set(action.index, initialAccount.set('hdpath', action.hdpath))
    );
  }
  return state;
}

function onSetHd(state, action) {
  if (action.type === ActionTypes.SET_BASEHD) {
    return state.setIn(['hd', 'base'], action.value);
  }
  return state;
}
function onSetOffset(state, action) {
  if (action.type === ActionTypes.SET_HDOFFSET) {
    return state.setIn(['hd', 'offset'], action.value);
  }
  return state;
}

function onConnected(state, action) {
  if (action.type === ActionTypes.CONNECTED) {
    return state.set('connected', action.value);
  }
  return state;
}

function onAddrSelected(state, action) {
  if (action.type === ActionTypes.ADDR_SELECTED) {
    return state.set('selectedAddr', action.value);
  }
  return state;
}

function onWatch(state, action) {
  if (action.type === ActionTypes.WATCH) {
    return state.set('watch', action.value);
  }
  return state;
}

export default function ledgerReducers(state, action) {
  state = state || initialState;
  state = onGetAddress(state, action);
  state = onSetPath(state, action);
  state = onSetOffset(state, action);
  state = onSetHd(state, action);
  state = onSetBalance(state, action);
  state = onSetTxCount(state, action);
  state = onConnected(state, action);
  state = onWatch(state, action);
  state = onAddrSelected(state, action);
  return state;
}
