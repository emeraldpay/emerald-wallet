import { fromJS } from 'immutable';
import { ActionTypes, LedgerAction } from './types';

export const initialState = fromJS({
  connected: false,
  watch: false,
  hd: {
    base: "m/44'/60'/160720'/0'",
    offset: 0
  },
  addresses: [],
  selectedAddr: null
});

const initialAccount = fromJS({
  hdpath: null,
  address: null,
  value: null,
  txcount: 0
});

function updateHd (state: any, hd: string, f: Function) {
  return state.update('addresses', (list: any) => {
    const pos = list.findKey((a: any) => a.get('hdpath') === hd);
    if (pos >= 0) {
      return list.update(pos, f);
    }
    return list;
  });
}

function onGetAddress (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.ADDR) {
    return updateHd(state, action.hdpath, (addr: any) => addr.set('address', action.addr));
  }
  return state;
}

function onSetBalance (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.ADDR_BALANCE) {
    return updateHd(state, action.hdpath, (addr: any) => addr.set('value', action.value));
  }
  return state;
}
function onSetTxCount (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.ADDR_TXCOUNT) {
    return updateHd(state, action.hdpath, (addr: any) => addr.set('txcount', action.value));
  }
  return state;
}

function onSetPath (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.SET_LIST_HDPATH) {
    return state.update('addresses', (list: any) => list.set(action.index, initialAccount.set('hdpath', action.hdpath)));
  }
  return state;
}

function onSetHd (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.SET_BASEHD) {
    return state.setIn(['hd', 'base'], action.value);
  }
  return state;
}
function onSetOffset (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.SET_HDOFFSET) {
    return state.setIn(['hd', 'offset'], action.value);
  }
  return state;
}

function onConnected (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.CONNECTED) {
    return state.set('connected', action.value);
  }
  return state;
}

function onAddrSelected (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.ADDR_SELECTED) {
    return state.set('selectedAddr', action.value);
  }
  return state;
}

function onWatch (state: any, action: LedgerAction) {
  if (action.type === ActionTypes.WATCH) {
    return state.set('watch', action.value);
  }
  return state;
}

export function reducer (state: any, action: LedgerAction): any {
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
