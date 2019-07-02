import thunkMiddleware from 'redux-thunk';

import {
  createStore as createReduxStore,
  applyMiddleware,
  combineReducers
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {
  addresses, blockchains, screen, ledger,
} from '@emeraldwallet/store';
import accounts from './vault/accounts';
import Addressbook from './vault/addressbook';
import tokens from './vault/tokens';
import network from './network';
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
  wallet: walletReducers,
  [addresses.moduleName]: addresses.reducer,
  blockchains: blockchains.reducer,
  screen: screen.reducer,
};

/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 * @param _api
 */
export const createStore = (_api) => {
  const sagaMiddleware = createSagaMiddleware();
  const storeMiddleware = [
    sagaMiddleware,
    reduxMiddleware.promiseCatchAll,
    thunkMiddleware.withExtraArgument(_api),
  ];

  if (process.env.NODE_ENV !== 'test') {
    storeMiddleware.push(reduxLogger);
  }

  const store = createReduxStore(
    combineReducers(reducers),
    applyMiddleware(...storeMiddleware)
  );

  sagaMiddleware.run(blockchains.sagas.watchRequestGasPrice, _api);

  return store;
};
