import { BackendApi, WalletApi } from '@emeraldwallet/core';
import { Store, applyMiddleware, createStore as createReduxStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import { IState, accounts, addressBook, hdpathPreview, reduxLogger, rootReducer, settings, wallet } from './';

/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 */
export const createStore = (api: WalletApi, backendApi: BackendApi): Store<IState> => {
  const sagaMiddleware = createSagaMiddleware();
  const storeMiddleware = [sagaMiddleware, thunkMiddleware.withExtraArgument({ api, backendApi })];

  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'debugging' || NODE_ENV === 'development') {
    storeMiddleware.push(reduxLogger);
  }

  const store = createReduxStore(rootReducer, applyMiddleware(...storeMiddleware));

  sagaMiddleware.run(accounts.sagas.root, api.vault, api.xPubPos);
  sagaMiddleware.run(addressBook.sagas.root, api.addressBook, api.vault);
  sagaMiddleware.run(hdpathPreview.sagas.root, api.vault);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(wallet.sagas.root);

  return store;
};
