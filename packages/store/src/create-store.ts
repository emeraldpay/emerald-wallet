import { IApi, IBackendApi } from '@emeraldwallet/core';
import { applyMiddleware, createStore as createReduxStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import {
  accounts,
  addressBook,
  blockchains,
  ledger,
  reduxLogger,
  rootReducer,
  settings,
  tokens,
  txhistory,
  wallet
} from './';

/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 */
export const createStore = (_api: IApi, backendApi: IBackendApi) => {
  const sagaMiddleware = createSagaMiddleware();
  const storeMiddleware = [
    sagaMiddleware,
    thunkMiddleware.withExtraArgument({ api: _api, backendApi })
  ];

  if (process.env.NODE_ENV === 'development') {
    storeMiddleware.push(reduxLogger);
  }

  const store = createReduxStore(
    rootReducer,
    applyMiddleware(...storeMiddleware)
  );

  sagaMiddleware.run(blockchains.sagas.root, backendApi);
  sagaMiddleware.run(addressBook.sagas.root, backendApi);
  sagaMiddleware.run(tokens.sagas.root, backendApi);
  sagaMiddleware.run(ledger.sagas.root, backendApi);
  sagaMiddleware.run(txhistory.sagas.root, backendApi);
  sagaMiddleware.run(wallet.sagas.root);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(accounts.sagas.root, backendApi);
  return store;
};
