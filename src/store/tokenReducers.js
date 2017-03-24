import Immutable from 'immutable'
import log from 'loglevel'

import { Wei } from '../lib/types'
import { toNumber } from '../lib/convert'

const initial = Immutable.fromJS({
    tokens: [],
    loading: false
});

const initialAddr = Immutable.Map({
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
                        .map(({id, abi, name, decimal, symbol}) => 
                            {
                                initialAddr.merge({
                                    'id': id,
                                    'abi': abi,
                                    'name': name,
                                    'decimal': decimal,
                                    'symbol': symbol
                                    });
                            })
                )
                .set('loading', false);
        default:
            return state
    }
}

function onSetTokenSupply(state, action) {
    if (action.type == 'TOKEN/SET_TOTAL_SUPPLY') {
        return updateAccount(state, action.accountId, (tok) =>
            tok.set('total', new Wei(action.value))
        );
    }
    return state
}

export const tokenReducers = function(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetTokenList(state, action);
    state = onSetTokenSupply(state, action);
    return state;
};