import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import { loadAccountsList, refreshTrackedTransactions } from './accountActions'
import { accountsReducers } from './accountReducers'
import { loadTokenList } from './tokenActions'
import { tokenReducers } from './tokenReducers'
import { gotoScreen } from './screenActions'
import { screenReducers } from './screenReducers'
import { loadSyncing, loadHeight } from './networkActions'
import { networkReducers } from './networkReducers'
import { reducer as formReducer } from 'redux-form';

const stateTransformer = (state) => {
    return {
        accounts: state.accounts.toJS(),
        tokens: state.tokens.toJS(),
        screen: state.screen.toJS(),
        network: state.network.toJS(),
        form: state.form,
    }
};

const loggerMiddleware = createLogger({
    stateTransformer
});

const reducers = {
    accounts: accountsReducers,
    tokens: tokenReducers,
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
    setTimeout(refreshAll, 2000)
}

export function start() {
    store.dispatch(loadAccountsList());
    store.dispatch(loadTokenList());
    store.dispatch(gotoScreen('home'));
    store.dispatch(loadHeight());
    setTimeout(() => store.dispatch(loadSyncing()), 3000); //check for syncing
    setTimeout(() => store.dispatch(loadSyncing()), 30000); //double check for syncing after 30 seconds
    setTimeout(refreshAll, 5000)
}