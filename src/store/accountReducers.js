import Immutable from 'immutable'
import log from 'loglevel'

import { Wei } from '../lib/types'

const initial = Immutable.fromJS({
    accounts: [],
    loading: false
});

const initialAddr = Immutable.Map({
    id: null,
    balance: null
});

function onLoading(state, action) {
    switch (action.type) {
        case 'ACCOUNT/LOADING':
            return state
                .set('loading', true);
        default:
            return state
    }
}

function onSetAccountsList(state, action) {
    switch (action.type) {
        case 'ACCOUNT/SET_LIST':
            return state
                .set('accounts',
                    Immutable.fromJS(action.accounts)
                        .map((id) => initialAddr.set('id', id))
                )
                .set('loading', false);
        default:
            return state
    }
}

function onSetBalance(state, action) {
    if (action.type == 'ACCOUNT/SET_BALANCE') {
        return state.update("accounts", (accounts) => {
            const pos = accounts.findKey((acc) => acc.get('id') === action.accountId);
            log.info("set balance at", pos, action.accountId);
            if (pos >= 0) {
                return accounts.update(pos, (acc) =>
                    acc.set('balance', new Wei(action.balance))
                )
            }
            return accounts
        })
    }
    return state
}

export const accountsReducers = function(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetAccountsList(state, action);
    state = onSetBalance(state, action);
    return state;
};