// @flow
import { fromJS, Map, List } from 'immutable';
import TokenUnits from 'lib/tokenUnits';
import { convert } from 'emerald-js';
import ActionTypes from './actionTypes';

const { toBigNumber } = convert;

// ----- STRUCTURES

const initial = fromJS({
  tokens: [],
  balances: new Map(),
  loading: false,
});

const initialTok = Map({
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
        .set('tokens', fromJS(action.tokens))
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

function onSetTokenBalance(state, action) {
  if (action.type === ActionTypes.SET_TOKEN_BALANCE) {
    let balances = state.get('balances');
    const address = action.accountId;

    let tokens = balances.get(address, new List());
    tokens = updateTokenBalance(tokens, action.token, action.value);
    balances = balances.set(address, tokens);
    return state.set('balances', balances);

    // return updateAccount(state, action.accountId, (acc) => {
    //   const tokens = fromJS(acc.get('tokens'));
    //   return acc.set('tokens', updateTokenBalance(tokens, action.token, action.value));
    // });
  }
  return state;
}

function updateTokenBalance(tokens, token, value) {
  const pos = tokens.findKey((tok) => tok.get('address') === token.address);

  const balance = new TokenUnits(
    convert.toBigNumber(value),
    convert.toBigNumber(token.decimals));

  if (pos >= 0) {
    return tokens.update(pos, (tok) =>
      tok.set('balance', balance)
        .set('symbol', token.symbol));
  }
  const newToken = fromJS({ address: token.address, symbol: token.symbol, balance });
  return tokens.push(newToken);
}

// ---- REDUCER

export default function tokenReducers(state, action) {
  state = state || initial;
  state = onLoading(state, action);
  state = onSetTokenList(state, action);
  state = onAddToken(state, action);
  state = onSetTokenInfo(state, action);
  state = onSetTokenBalance(state, action);
  return state;
}
