import thunkMiddleware from 'redux-thunk';
import {
  createStore as createReduxStore,
  applyMiddleware,
  combineReducers
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {
  addresses, blockchains, screen, ledger, connection, addressBook, txhistory, tokens, wallet, settings, addAccount
} from '@emeraldwallet/store';
import reduxLogger from '../utils/redux-logger';
import reduxMiddleware from './middleware';
import launcherReducers from './launcher/launcherReducers';

const walletReducers = combineReducers({
  history: txhistory.reducer,
  settings: settings.reducer,
});

const reducers = {
  [addressBook.moduleName]: addressBook.reducer,
  [tokens.moduleName]: tokens.reducer,
  launcher: launcherReducers,
  ledger: ledger.reducer,
  wallet: walletReducers,
  [addresses.moduleName]: addresses.reducer,
  blockchains: blockchains.reducer,
  screen: screen.reducer,
  conn: connection.reducer,
  addAccount: addAccount.reducer
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

  sagaMiddleware.run(blockchains.sagas.root, _api);
  sagaMiddleware.run(ledger.sagas.root, _api);
  sagaMiddleware.run(addressBook.sagas.root, _api);
  sagaMiddleware.run(txhistory.sagas.root, _api);
  sagaMiddleware.run(tokens.sagas.root, _api);
  sagaMiddleware.run(wallet.sagas.root, _api);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(addresses.sagas.root, _api);
  return store;
};
