import Immutable from 'immutable';
import { convert, Wei } from 'emerald-js';

import { TokenUnits } from '../lib/tokenUnits';

const { toNumber } = convert;

const initial = Immutable.fromJS({
    accounts: [],
    loading: false,

});

const initialAccount = Immutable.Map({
    id: null,
    hardware: false,
    balance: null,
    balancePending: null,
    tokens: [],
    txcount: null,
    name: null,
    description: null,
});

function addAccount(state, id, name, description) {
    return state.update('accounts', (accounts) => {
        const pos = accounts.findKey((acc) => acc.get('id') === id);
        if (pos >= 0) {
            return accounts;
        }
        return accounts.push(initialAccount.merge({ id, name, description }));
    });
}

function updateAccount(state, id, f) {
    return state.update('accounts', (accounts) => {
        const pos = accounts.findKey((acc) => acc.get('id') === id);
        if (pos >= 0) {
            return accounts.update(pos, f);
        }
        return accounts;
    });
}

function updateToken(tokens, token, value) {
    const pos = tokens.findKey((tok) => tok.get('address') === token.address);
    const balance = new TokenUnits(value, (token.decimals) ? token.decimals : '0x0');
    if (pos >= 0) {
        return tokens.update(pos, (tok) => tok.set('balance', balance));
    }
    return tokens.push(Immutable.fromJS({ address: token.address, symbol: token.symbol })
            .set('balance', balance));
}

function onLoading(state, action) {
    switch (action.type) {
        case 'ACCOUNT/LOADING':
            return state
                .set('loading', true);
        default:
            return state;
    }
}

function onSetAccountsList(state, action) {
    switch (action.type) {
        case 'ACCOUNT/SET_LIST':
            const existingAccounts = state.get('accounts');
            const getExisting = (id) => {
                const pos = existingAccounts.findKey((x) => x.get('id') === id);
                if (pos >= 0) {
                    return existingAccounts.get(pos);
                }
                return initialAccount;
            };
            const updatedList = Immutable.fromJS(action.accounts).map((acc) =>
                Immutable.fromJS({
                    name: acc.get('name'),
                    description: acc.get('description'),
                    id: acc.get('address'),
                    hardware: acc.get('hardware'),
                })
            ).map((acc) =>
                getExisting(acc.get('id')).merge(acc)
            );
            return state
                .set('accounts', updatedList)
                .set('loading', false);
        default:
            return state;
    }
}

function onUpdateAccount(state, action) {
    if (action.type === 'ACCOUNT/UPDATE_ACCOUNT') {
        return updateAccount(state, action.address, (acc) =>
            acc.set('name', action.name)
                .set('description', action.description)
        );
    }
    return state;
}

function onSetBalance(state, action) {
    if (action.type === 'ACCOUNT/SET_BALANCE') {
        return updateAccount(state, action.accountId, (acc) => {
            // Update balance only if it's changed
            const newBalance = new Wei(action.value);
            const currentBalance = acc.get('balance');
            if (currentBalance && currentBalance.equals(newBalance)) {
                return acc.set('balancePending', null);
            }
            return acc
                    .set('balance', newBalance)
                    .set('balancePending', null);
        });
    }
    return state;
}

function onSetTokenBalance(state, action) {
    if (action.type === 'ACCOUNT/SET_TOKEN_BALANCE') {
        return updateAccount(state, action.accountId, (acc) => {
            const tokens = Immutable.fromJS(acc.get('tokens'));
            return acc.set('tokens', updateToken(tokens, action.token, action.value));
        }
        );
    }
    return state;
}

function onSetTxCount(state, action) {
    if (action.type === 'ACCOUNT/SET_TXCOUNT') {
        return updateAccount(state, action.accountId, (acc) =>
            acc.set('txcount', toNumber(action.value))
        );
    }
    return state;
}

function onAddAccount(state, action) {
    if (action.type === 'ACCOUNT/ADD_ACCOUNT') {
        return addAccount(state, action.accountId, action.name, action.description);
    }
    return state;
}

function onPendingBalance(state, action) {
    if (action.type === 'ACCOUNT/PENDING_BALANCE') {
        let bal;
        if (action.to) {
            return updateAccount(state, action.to, (acc) => {
                bal = acc.get('balance').plus(new Wei(action.value));
                return acc.set('balancePending', bal);
            });
        } else if (action.from) {
            return updateAccount(state, action.from, (acc) => {
                bal = acc.get('balance').sub(new Wei(action.value));
                return acc.set('balancePending', bal);
            });
        }
    }
    return state;
}

export default function accountsReducers(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetAccountsList(state, action);
    state = onAddAccount(state, action);
    state = onUpdateAccount(state, action);
    state = onSetBalance(state, action);
    state = onSetTxCount(state, action);
    state = onSetTokenBalance(state, action);
    state = onPendingBalance(state, action);
    return state;
}
