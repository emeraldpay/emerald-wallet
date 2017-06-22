import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { loadAccountsList, refreshTrackedTransactions, loadPendingTransactions,
    getGasPrice, getExchangeRates } from './accountActions';
import { loadAddressBook } from './addressActions';
import { loadTokenList } from './tokenActions';
import { loadContractList } from './contractActions';
import { loadSyncing, loadHeight, loadPeerCount } from './networkActions';
import { gotoScreen } from './screenActions';
import { readConfig, listenElectron } from './launcherActions';

import accountsReducers from './accountReducers';
import addressReducers from './addressReducers';
import tokenReducers from './tokenReducers';
import contractReducers from './contractReducers';
import networkReducers from './networkReducers';
import screenReducers from './screenReducers';
import launcherReducers from './launcherReducers';

import { ipcRenderer } from 'electron';

import log from 'loglevel';

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
    launcher: state.launcher.toJS(),
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
    launcher: launcherReducers,
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
    store.dispatch(loadPeerCount());
    setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);
}

function refreshLong() {
    store.dispatch(getExchangeRates());
    setTimeout(refreshLong, intervalRates.continueRefreshLongRate);
}

export function startSync() {
    store.dispatch(loadAccountsList());
    store.dispatch(getGasPrice());
    // store.dispatch(loadAddressBook());
    // store.dispatch(loadTokenList());
    // store.dispatch(loadContractList());
    store.dispatch(loadHeight());
    // check for syncing
    setTimeout(() => store.dispatch(loadSyncing()), intervalRates.second); // prod: intervalRates.second
    // double check for syncing
    setTimeout(() => store.dispatch(loadSyncing()), 2 * intervalRates.minute); // prod: 30 * this.second
    setTimeout(() => store.dispatch(loadPendingTransactions()), intervalRates.refreshAllTxRate);
    setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);
    setTimeout(refreshLong, 3 * intervalRates.second);
}

export function stopSync() {
    //TODO
}

export function start() {
    store.dispatch(readConfig());
    store.dispatch(listenElectron());
    store.dispatch(gotoScreen('welcome'));
}

export function waitForServices() {
    let unsubscribe = store.subscribe(() => {
        let state = store.getState();
        if (state.launcher.getIn(["status", "geth"]) === 'ready'
            && state.launcher.getIn(["status", "connector"]) === 'ready') {
            unsubscribe();
            log.info("All services are ready to use by Wallet");
            startSync();
            if (state.screen.get("screen") === 'welcome') {
                store.dispatch(gotoScreen('home'));
            }
        }
    });

    function checkServiceStatus() {
        ipcRenderer.send("get-status");
    }
    setTimeout(checkServiceStatus, 2000);
}

waitForServices();
