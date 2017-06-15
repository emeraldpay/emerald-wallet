import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { loadAccountsList, refreshTrackedTransactions, loadPendingTransactions,
    getGasPrice, getExchangeRates } from './accountActions';
import { loadAddressBook } from './addressActions';
import { loadTokenList } from './tokenActions';
import { loadContractList } from './contractActions';
import { loadSyncing, loadHeight } from './networkActions';
import { gotoScreen } from './screenActions';

import accountsReducers from './accountReducers';
import addressReducers from './addressReducers';
import tokenReducers from './tokenReducers';
import contractReducers from './contractReducers';
import networkReducers from './networkReducers';
import screenReducers from './screenReducers';

const second = 1000;
const minute = 60 * second;
export const intervalRates = {
    second, // (whilei) this must be the newfangled object-shorthand...?
    minute,
    // (whilei: development: loading so often slows things a lot for me and clutters logs; that's why I have
    // stand-in times here for development)
    // Continue is repeating timeouts.
    continueLoadSyncRate: minute, // prod: second
    continueLoadHeightRate: 5 * minute, // prod: 5 * second
    continueRefreshAllTxRate: 10 * second, // prod: 2 * second
    continueRefreshLongRate: 900000, // 5 o'clock somewhere.
};

const stateTransformer = (state) => ({
    accounts: state.accounts.toJS(),
    addressBook: state.addressBook.toJS(),
    tokens: state.tokens.toJS(),
    contracts: state.contracts.toJS(),
    screen: state.screen.toJS(),
    network: state.network.toJS(),
    form: state.form,
});

const loggerMiddleware = createLogger({
    stateTransformer,
});

const reducers = {
    accounts: accountsReducers,
    addressBook: addressReducers,
    tokens: tokenReducers,
    contracts: contractReducers,
    screen: screenReducers,
    network: networkReducers,
    form: formReducer,
};

export const store = createStore(
    combineReducers(reducers),
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);

function refreshAll() {
    store.dispatch(refreshTrackedTransactions());
    setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);
}

function refreshLong() {
    store.dispatch(getExchangeRates());
    setTimeout(refreshLong, intervalRates.continueRefreshLongRate);
}

export function start() {
    store.dispatch(loadAccountsList());
    store.dispatch(getGasPrice());
    store.dispatch(loadAddressBook());
    store.dispatch(loadTokenList());
    store.dispatch(loadContractList());
    store.dispatch(gotoScreen('home'));
    store.dispatch(loadHeight());
    // check for syncing
    setTimeout(() => store.dispatch(loadSyncing()), intervalRates.second); // prod: intervalRates.second
    // double check for syncing
    setTimeout(() => store.dispatch(loadSyncing()), 2 * intervalRates.minute); // prod: 30 * this.second
    setTimeout(() => store.dispatch(loadPendingTransactions()), intervalRates.refreshAllTxRate);
    setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);
    setTimeout(refreshLong, intervalRates.continueRefreshLongRate);
}
