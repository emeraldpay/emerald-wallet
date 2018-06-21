// @flow
import { fromJS, Map, List } from 'immutable';
import { convert } from 'emerald-js';
import TokenUnits from '../../../lib/tokenUnits';
import ActionTypes from './actionTypes';

const { toBigNumber } = convert;

// ----- STRUCTURES

const initial = fromJS({
  tokens: [],
  balances: new Map(),
  loading: false,
});

const initialToken = Map({
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
    return tokens.push(initialToken.merge({ address, name }));
  });
}

function updateTokenBalance(balances, token, value) {
  const pos = balances.findKey((tok) => tok.get('address') === token.address);

  const balance = new TokenUnits(
    convert.toBigNumber(value),
    convert.toBigNumber(token.decimals));

  if (pos >= 0) {
    return balances.update(pos, (tok) =>
      tok.set('balance', balance)
        .set('symbol', token.symbol));
  }
  const newToken = fromJS({
    address: token.address,
    symbol: token.symbol,
    balance,
  });
  return balances.push(newToken);
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

function onRemoveToken(state, action) {
  if (action.type === ActionTypes.REMOVE_TOKEN) {
    return state.set(
      'tokens',
      state.get('tokens').filterNot((token) => token.get('address') === action.address)
    );
  }
  return state;
}

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
    if (!action.token) {
      throw new Error('Invalid action parameters - token property not found');
    }
    let balances = state.get('balances');
    const address = action.accountId;

    let tokens = balances.get(address, new List());
    tokens = updateTokenBalance(tokens, action.token, action.value);
    balances = balances.set(address, tokens);
    return state.set('balances', balances);
  }
  return state;
}

function onSetTokensBalances(state, action) {
  if (action.type === ActionTypes.SET_TOKENS_BALANCES) {
    const address = action.accountId;
    let allBalances = state.get('balances');
    let addressBalances = allBalances.get(address, new List());

    action.balances.forEach((item) => {
      const tokenInfo = state.get('tokens').find((t) => t.get('address') === item.tokenAddress);
      addressBalances = updateTokenBalance(addressBalances, tokenInfo.toJS(), item.amount);
    });

    allBalances = allBalances.set(address, addressBalances);
    return state.set('balances', allBalances);
  }
  return state;
}

function onResetBalances(state, action) {
  if (action.type === ActionTypes.RESET_BALANCES) {
    return state.set('balances', new Map());
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
  state = onSetTokenBalance(state, action);
  state = onSetTokensBalances(state, action);
  state = onResetBalances(state, action);
  state = onRemoveToken(state, action);
  return state;
}
