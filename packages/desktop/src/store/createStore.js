import thunkMiddleware from 'redux-thunk';
import {
  createStore as createReduxStore,
  applyMiddleware
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {
  accounts,
  blockchains,
  ledger,
  addressBook,
  txhistory,
  tokens,
  wallet,
  settings,
  rootReducer
} from '@emeraldwallet/store';
import reduxLogger from '../utils/redux-logger';
import reduxMiddleware from './middleware';

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
    rootReducer,
    applyMiddleware(...storeMiddleware)
  );

  sagaMiddleware.run(blockchains.sagas.root, _api);
  sagaMiddleware.run(ledger.sagas.root, _api);
  sagaMiddleware.run(addressBook.sagas.root, _api);
  sagaMiddleware.run(txhistory.sagas.root, _api);
  sagaMiddleware.run(tokens.sagas.root, _api);
  sagaMiddleware.run(wallet.sagas.root, _api);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(accounts.sagas.root, _api);
  return store;
};
