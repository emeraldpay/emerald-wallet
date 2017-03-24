import Immutable from 'immutable'
import log from 'loglevel'

import { TokenUnits } from '../lib/types'
import { toNumber } from '../lib/convert'

const initial = Immutable.fromJS({
    tokens: [],
    loading: false
});

const initialTok = Immutable.Map({
    id: null,
    abi: null,
    name: null,
    decimal: null,
    symbol: null,
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

function onSetTokenSupply(state, action) {
    if (action.type == 'TOKEN/SET_TOTAL_SUPPLY') {
        return updateToken(state, action.tokenId, (tok) =>
            tok.set('total', new TokenUnits(action.value, action.decimal))
        );
    }
    return state
}

function updateToken(state, id, f) {
    return state.update("tokens", (tokens) => {
        const pos = tokens.findKey((tok) => tok.get('id') === id);
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
    state = onSetTokenSupply(state, action);
    return state;
};