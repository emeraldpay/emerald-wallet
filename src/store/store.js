import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import { loadAccountsList } from './accountActions'
import { accountsReducers } from './accountReducers';

const stateTransformer = (state) => {
    return {
        accounts: state.accounts.toJS()
    }
};

const loggerMiddleware = createLogger({
    stateTransformer
});

const reducers = {
    accounts: accountsReducers,
};

export const store = createStore(
    combineReducers(reducers),
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);

store.dispatch(loadAccountsList());