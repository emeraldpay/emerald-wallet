import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { loadAccountsList, refreshTrackedTransactions } from './accountActions';
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
    setTimeout(refreshAll, 2000);
}

export function start() {
    store.dispatch(loadAccountsList());
    store.dispatch(loadAddressBook());
    store.dispatch(loadTokenList());
    store.dispatch(loadContractList());
    store.dispatch(gotoScreen('home'));
    store.dispatch(loadHeight());
    setTimeout(() => store.dispatch(loadSyncing()), 3000); // check for syncing
    setTimeout(() => store.dispatch(loadSyncing()), 30000); // double check for syncing after 30 seconds
    setTimeout(refreshAll, 5000);
}
