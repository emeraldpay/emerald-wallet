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
  rootReducer,
  reduxLogger
} from '@emeraldwallet/store';
import reduxMiddleware from './middleware';

/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 * @param _api
 */
export const createStore = (_api, backendApi) => {
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

  sagaMiddleware.run(blockchains.sagas.root, backendApi);
  sagaMiddleware.run(addressBook.sagas.root, backendApi);
  sagaMiddleware.run(tokens.sagas.root, backendApi);

  sagaMiddleware.run(ledger.sagas.root, _api);
  sagaMiddleware.run(txhistory.sagas.root, _api);
  sagaMiddleware.run(wallet.sagas.root, _api);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(accounts.sagas.root, _api);
  return store;
};
