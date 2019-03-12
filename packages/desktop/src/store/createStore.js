import thunkMiddleware from 'redux-thunk';
import {
  createStore as createReduxStore,
  applyMiddleware,
  combineReducers
} from 'redux';
import {reducer as formReducer} from 'redux-form';
import accounts from './vault/accounts';
import Addressbook from './vault/addressbook';
import tokens from './vault/tokens';
import network from './network';
import ledger from './ledger';
import reduxLogger from '../utils/redux-logger';
import reduxMiddleware from './middleware';
import launcherReducers from './launcher/launcherReducers';
import walletReducers from './wallet/walletReducers';

const reducers = {
  accounts: accounts.reducer,
  addressBook: Addressbook.reducer,
  tokens: tokens.reducer,
  network: network.reducer,
  launcher: launcherReducers,
  ledger: ledger.reducer,
  form: formReducer,
  wallet: walletReducers,
};
/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 * @param _api
 */
export const createStore = (_api) => {
  const storeMiddleware = [
    reduxMiddleware.promiseCatchAll,
    thunkMiddleware.withExtraArgument(_api),
  ];

  if (process.env.NODE_ENV !== 'test') {
    storeMiddleware.push(reduxLogger);
  }

  return createReduxStore(
    combineReducers(reducers),
    applyMiddleware(...storeMiddleware)
  );
};
