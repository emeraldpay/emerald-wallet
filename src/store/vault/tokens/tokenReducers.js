import Immutable from 'immutable';
import TokenUnits from 'lib/tokenUnits';
import { convert } from 'emerald-js';
import ActionTypes from './actionTypes';

const { toBigNumber } = convert;

// ----- STRUCTURES

const initial = Immutable.fromJS({
  tokens: [],
  loading: false,
});

const initialTok = Immutable.Map({
  address: null,
  name: null,
  abi: null,
  features: [],
  decimals: null,
  symbol: null,
  totalSupply: null,
  total: null,
});

// ----- UTILITY FUNCTIONS

function addToken(state, address, name) {
  return state.update('tokens', (tokens) => {
    const pos = tokens.findKey((tok) => tok.get('address') === address);
    if (pos >= 0) {
      return tokens;
    }
    return tokens.push(initialTok.merge({ address, name }));
  });
}


function updateToken(state, id, f) {
  return state.update('tokens', (tokens) => {
    const pos = tokens.findKey((tok) => tok.get('address') === id);
    if (pos >= 0) {
      return tokens.update(pos, f);
    }
    return tokens;
  });
}

// ----- REDUCERS

function onLoading(state, action) {
  switch (action.type) {
    case ActionTypes.LOADING:
      return state.set('loading', true);
    default:
      return state;
  }
}

function onSetTokenList(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LIST:
      return state
        .set('tokens', Immutable.fromJS(action.tokens))
        .set('loading', false);
    default:
      return state;
  }
}

function calcToken(tok) {
  const amount = new TokenUnits(
    toBigNumber(tok.get('totalSupply', '0x0')),
    toBigNumber(tok.get('decimals', '0x0')));

  return tok.set('total', amount);
}

function onSetTokenInfo(state, action) {
  if (action.type === ActionTypes.SET_INFO) {
    return updateToken(state, action.address, (token) => {
      const newToken = token
        .set('symbol', action.symbol)
        .set('decimals', action.decimals)
        .set('totalSupply', action.totalSupply);
      return calcToken(newToken);
    });
  }
  return state;
}

function onAddToken(state, action) {
  if (action.type === ActionTypes.ADD_TOKEN) {
    return addToken(state, action.address, action.name);
  }
  return state;
}

// ---- REDUCER

export default function tokenReducers(state, action) {
  state = state || initial;
  state = onLoading(state, action);
  state = onSetTokenList(state, action);
  state = onAddToken(state, action);
  state = onSetTokenInfo(state, action);
  return state;
}
