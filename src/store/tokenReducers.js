import Immutable from 'immutable';
import { TokenUnits } from '../lib/tokenUnits';

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
    totalFull: null,
    total: null,
});

// ----- UTILITY FUNCTIONS

function addToken(state, address, name) {
    return state.update('tokens', (tokens) =>
        tokens.push(initialTok.merge({ address, name }))
    );
}

function calcToken(tok) {
    return tok.set('total', new TokenUnits(tok.get('totalFull', '0x0'), tok.get('decimals', '0x0')));
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
        case 'TOKEN/LOADING':
            return state
                .set('loading', true);
        default:
            return state;
    }
}

function onSetTokenList(state, action) {
    switch (action.type) {
        case 'TOKEN/SET_LIST':
            return state
                .set('tokens',
                    Immutable.fromJS(action.tokens)
                )
                .set('loading', false);
        default:
            return state;
    }
}

function onSetTotalSupply(state, action) {
    if (action.type === 'TOKEN/SET_TOTAL_SUPPLY') {
        return updateToken(state, action.address, (tok) =>
            calcToken(tok.set('totalFull', action.value))
        );
    }
    return state;
}
function onSetDecimals(state, action) {
    if (action.type === 'TOKEN/SET_DECIMALS') {
        return updateToken(state, action.address, (tok) =>
            calcToken(tok.set('decimals', action.value))
        );
    }
    return state;
}
function onSetSymbol(state, action) {
    if (action.type === 'TOKEN/SET_SYMBOL') {
        return updateToken(state, action.address, (tok) =>
            tok.set('symbol', action.value)
        );
    }
    return state;
}

function onAddToken(state, action) {
    if (action.type === 'TOKEN/ADD_TOKEN') {
        return addToken(state, action.address, action.name);
    }
    return state;
}

// ---- REDUCER

export default function tokenReducers(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetTokenList(state, action);
    state = onSetTotalSupply(state, action);
    state = onSetDecimals(state, action);
    state = onSetSymbol(state, action);
    state = onAddToken(state, action);
    return state;
}
