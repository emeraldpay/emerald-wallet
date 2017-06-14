import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { loadAccountsList, refreshTrackedTransactions, getGasPrice, getExchangeRates } from './accountActions';
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

export const rates = {
    // (whilei: development: loading so often slows things a lot for me and clutters logs)
    // all rates in milliseconds
    loadSyncRate: 60 * 1000, // prod: 1000
    loadSyncCheckRate: 3 * 60 * 1000, // prod: 3000
    loadSyncDoublecheckRate: 15 * 60 * 1000, // prod: 30 * 1000
    loadHeightRate: 5 * 60 * 1000, // prod: 5000
    getExchangeRatesRate: 900000,
    refreshAllTxRate: 20 * 2000, // prod: 2000
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
    setTimeout(refreshAll, rates.refreshAllTxRate);
}

export function start() {
    store.dispatch(loadAccountsList());
    store.dispatch(getGasPrice());
    store.dispatch(loadAddressBook());
    store.dispatch(loadTokenList());
    store.dispatch(loadContractList());
    store.dispatch(gotoScreen('home'));
    store.dispatch(loadHeight());
    setTimeout(() => store.dispatch(getExchangeRates()), rates.getExchangeRatesRate);
    // check for syncing
    setTimeout(() => store.dispatch(loadSyncing()), rates.loadSyncCheckRate);
    // double check for syncing after 30 seconds
    setTimeout(() => store.dispatch(loadSyncing()), rates.loadSyncDoublecheckRate);
    setTimeout(refreshAll, 5000);
}
