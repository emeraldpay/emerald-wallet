import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware, combineReducers } from 'redux'

import { loadAccountsList } from './accountActions'
import { accountsReducers } from './accountReducers'
import { open } from './screenActions'
import { screenReducers } from './screenReducers'

const stateTransformer = (state) => {
    return {
        accounts: state.accounts.toJS(),
        screen: state.screen.toJS()
    }
};

const loggerMiddleware = createLogger({
    stateTransformer
});

const reducers = {
    accounts: accountsReducers,
    screen: screenReducers
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