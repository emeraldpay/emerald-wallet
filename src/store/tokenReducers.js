import Immutable from 'immutable'
import log from 'loglevel'

import { TokenUnits } from '../lib/types'
import { toNumber } from '../lib/convert'

const initial = Immutable.fromJS({
    tokens: [],
    loading: false
});

const initialTok = Immutable.Map({
    address: null,
    name: null,
    abi: null,
    features: [],

    decimals: null,
    symbol: null,
    totalFull: null,
    total: null
});

function onLoading(state, action) {
    switch (action.type) {
        case 'TOKEN/LOADING':
            return state
                .set('loading', true);
        default:
            return state
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
            return state
    }
}

function onSetTotalSupply(state, action) {
    if (action.type === 'TOKEN/SET_TOTAL_SUPPLY') {
        return updateToken(state, action.address, (tok) =>
            calcToken(tok.set('totalFull', action.value))
        );
    }
    return state
}
function onSetDecimals(state, action) {
    if (action.type === 'TOKEN/SET_DECIMALS') {
        return updateToken(state, action.address, (tok) =>
            calcToken(tok.set('decimals', action.value))
        );
    }
    return state
}

function calcToken(tok) {
    return tok.set('total', new TokenUnits(tok.get('totalFull', '0x0'), tok.get('decimals', '0x0')))
}

function updateToken(state, address, f) {
    return state.update("tokens", (tokens) => {
        const pos = tokens.findKey((tok) => tok.get('address') === address);
        if (pos >= 0) {
            return tokens.update(pos, f)
        }
        return tokens
    })
}

export const tokenReducers = function(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetTokenList(state, action);
    state = onSetTotalSupply(state, action);
    state = onSetDecimals(state, action);
    return state;
};