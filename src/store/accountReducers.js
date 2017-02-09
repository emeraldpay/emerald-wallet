import Immutable from 'immutable'
import log from 'loglevel'

import { Wei } from '../lib/types'
import { toNumber } from '../lib/convert'

const initial = Immutable.fromJS({
    accounts: [],
    loading: false
});

const initialAddr = Immutable.Map({
    id: null,
    balance: null,
    txcount: null
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
        return updateAccount(state, action.accountId, (acc) =>
            acc.set('balance', new Wei(action.value))
        );
    }
    return state
}

function onSetTxCount(state, action) {
    if (action.type == 'ACCOUNT/SET_TXCOUNT') {
        return updateAccount(state, action.accountId, (acc) =>
            acc.set("txcount", toNumber(action.value))
        )
    }
    return state
}

function updateAccount(state, id, f) {
    return state.update("accounts", (accounts) => {
        const pos = accounts.findKey((acc) => acc.get('id') === id);
        if (pos >= 0) {
            return accounts.update(pos, f)
        }
        return accounts
    })
}

export const accountsReducers = function(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetAccountsList(state, action);
    state = onSetBalance(state, action);
    state = onSetTxCount(state, action);
    return state;
};