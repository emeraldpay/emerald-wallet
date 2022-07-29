import { IBackendApi, WalletStateStorage, WalletApi } from '@emeraldwallet/core';
import { applyMiddleware, createStore as createReduxStore, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import {
  accounts,
  addressBook,
  blockchains,
  hdpathPreview,
  hwkey,
  reduxLogger,
  rootReducer,
  settings,
  tokens,
  wallet,
} from './';

import { Triggers } from './triggers';

/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 */
export const createStore = (api: WalletApi, backendApi: IBackendApi, walletState: WalletStateStorage): Store => {
  const triggers = new Triggers();

  const sagaMiddleware = createSagaMiddleware();
  const storeMiddleware = [sagaMiddleware, thunkMiddleware.withExtraArgument({ api, backendApi, triggers })];

  if (process.env.NODE_ENV === 'development') {
    storeMiddleware.push(reduxLogger);
  }

  const store = createReduxStore(rootReducer, applyMiddleware(...storeMiddleware));

  sagaMiddleware.run(blockchains.sagas.root, backendApi);
  sagaMiddleware.run(addressBook.sagas.root, api.addressBook, api.vault);
  sagaMiddleware.run(tokens.sagas.root, backendApi);
  sagaMiddleware.run(hwkey.sagas.root, api.vault);
  sagaMiddleware.run(wallet.sagas.root);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(accounts.sagas.root, api.vault, walletState);
  sagaMiddleware.run(hdpathPreview.sagas.root, api.vault, backendApi);

  triggers.setStore(store);

  hwkey.triggers.run(triggers);
  hdpathPreview.triggers.run(triggers);

  return store;
};
