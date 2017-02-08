import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import { loadAccountsList } from './accountActions'
import { accountsReducers } from './accountReducers'
import { open } from './screenActions'
import { screenReducers } from './screenReducers'
import { loadSyncing, loadHeight } from './networkActions'
import { networkReducers } from './networkReducers'

const stateTransformer = (state) => {
    return {
        accounts: state.accounts.toJS(),
        screen: state.screen.toJS(),
        network: state.network.toJS()
    }
};

const loggerMiddleware = createLogger({
    stateTransformer
});

const reducers = {
    accounts: accountsReducers,
    screen: screenReducers,
    network: networkReducers
};

export const store = createStore(
    combineReducers(reducers),
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);

store.dispatch(loadAccountsList());
store.dispatch(open('home'));
store.dispatch(loadSyncing());
store.dispatch(loadHeight());