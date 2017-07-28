import Immutable from 'immutable';
import log from 'electron-log';
import { Wei, TokenUnits } from '../lib/types';
import { toNumber } from '../lib/convert';

const initial = Immutable.fromJS({
    accounts: [],
    trackedTransactions: [],
    loading: false,
    gasPrice: new Wei(23000000000),
    rates: {},
    localeCurrency: 'USD', // prod: localeCurrency localized from OS.
    localeRate: null,
});

const initialAddr = Immutable.Map({
    id: null,
    hardware: false,
    balance: null,
    balancePending: null,
    tokens: [],
    txcount: null,
    name: null,
    description: null,
});

const initialTx = Immutable.Map({
    hash: null,
    blockNumber: null,
    timestamp: null,
    from: null,
    to: null,
    value: null,
    data: null,
    gas: null,
    gasPrice: null,
    nonce: null,
});

function addAccount(state, id, name, description) {
    return state.update('accounts', (accounts) =>
        accounts.push(initialAddr.merge({ id, name, description }))
    );
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
            function getExisting(id) {
                const pos = existingAccounts.findKey((x) => x.get('id') === id);
                if (pos >= 0) {
                    return existingAccounts.get(pos)
                }
                return initialAddr;
            }
            const updatedList = Immutable.fromJS(action.accounts).map((acc) =>
                Immutable.fromJS({
                    name: acc.get('name'),
                    description: acc.get('description'),
                    id: acc.get('address'),
                    hardware: acc.get('hardware')
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
        return updateAccount(state, action.accountId, (acc) =>
            acc.set('balance', new Wei(action.value))
                .set('balancePending', null)
        );
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

function createTx(data) {
    let tx = initialTx.merge({
        hash: data.hash,
        to: data.to,
        gas: data.gas,
        gasPrice: data.gasPrice,
    });
    if (data.from !== '0x0000000000000000000000000000000000000000') {
        tx = tx.set('from', data.from)
    }
    if (typeof data.value === 'string') {
        tx = tx.set('value', new Wei(data.value));
    }
    if (typeof data.gasPrice === 'string' || typeof data.gasPrice === 'number') {
        tx = tx.set('gasPrice', new Wei(data.gasPrice));
    }
    if (typeof data.gas === 'string' || typeof data.gas === 'number') {
        tx = tx.set('gas', toNumber(data.gas));
    }
    if (typeof data.nonce === 'string') {
        tx = tx.set('nonce', toNumber(data.nonce))
    }
    // If is not pending, fill in finalized attributes.
    if (typeof data.blockNumber !== 'undefined' && data.blockNumber !== null) {
        tx = tx.merge({
            blockHash: data.blockHash,
            blockNumber: data.blockNumber,
            nonce: toNumber(data.nonce),
            replayProtected: data.replayProtected,
            input: data.input,
        });
    }
    return tx;
}

function isTracked(state, tx) {
    return state.get('trackedTransactions').some((x) => tx.hash === x.hash)
}

function onLoadPending(state, action) {
    if (action.type === 'ACCOUNT/PENDING_TX') {
        const txes = [];
        for (let tx of action.txList) {
            txes.push(createTx(tx));
        }
        return state.set('trackedTransactions', Immutable.fromJS(txes));
    }
    return state;
}

function onTrackTx(state, action) {
    if (action.type === 'ACCOUNT/TRACK_TX') {
        const data = createTx(action.tx);
        if (isTracked(state, data)) {
            return state
        }
        return state.update('trackedTransactions', (txes) => txes.push(data));
    }
    return state;
}

function onUpdateTx(state, action) {
    if (action.type === 'ACCOUNT/UPDATE_TX') {
        return state.update('trackedTransactions', (txes) => {
            const pos = txes.findKey((tx) => tx.get('hash') === action.tx.hash);
            if (pos >= 0) {
                txes = txes.update(pos, (tx) => tx.mergeWith((o,n) => o || n, createTx(action.tx)));
            }
            // It seems kind of sloppy to store whole txs, when all we
            // really need is hashes. But even if a pending transaction is stored
            // and program closed, the interval-ized ACCOUNT/UPDATE_TX will refresh
            // the data via the RPCAPI. So there is not much to lose except a couple of
            // kilobytes.
            localStorage.setItem('trackedTransactions', JSON.stringify(txes.toJS()));
            return txes;
        });
    }
    return state;
}

function onGasPrice(state, action) {
    if (action.type === 'ACCOUNT/GAS_PRICE') {
        return state.set('gasPrice', new Wei(action.value));
    }
    return state;
}

function onExchangeRates(state, action) {
    if (action.type === 'ACCOUNT/EXCHANGE_RATES') {
        const localeRate = action.rates[state.get('localeCurrency').toLowerCase()];
        return state.set('rates', Immutable.fromJS(action.rates))
            .set('localeRate', localeRate);
    }
    return state;
}

function onLoadStoredTransactions(state, action) {
    if (action.type === 'ACCOUNT/LOAD_STORED_TXS') {
        let txes = state.get('trackedTransactions');
        for (const tx of action.transactions) {
            // In case of dupe pending txs.
            const pos = txes.findKey((Tx) => Tx.get('hash') === tx.hash);
            if (pos >= 0) {
                txes = txes.set(pos, createTx(tx));
            } else {
                txes = txes.push(createTx(tx));
            }
        }
        return state.set('trackedTransactions', Immutable.fromJS(txes));
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
    state = onTrackTx(state, action);
    state = onUpdateTx(state, action);
    state = onGasPrice(state, action);
    state = onLoadPending(state, action);
    state = onPendingBalance(state, action);
    state = onExchangeRates(state, action);
    state = onLoadStoredTransactions(state, action);
    return state;
}
