import {IApi, IBackendApi, WalletStateStorage} from '@emeraldwallet/core';
import {applyMiddleware, createStore as createReduxStore} from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import {
  accounts,
  addressBook,
  blockchains,
  hwkey,
  reduxLogger,
  rootReducer,
  settings,
  tokens,
  txhistory,
  wallet,
  hdpathPreview
} from './';

import {Triggers} from "./triggers";

/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 */
export const createStore = (_api: IApi, backendApi: IBackendApi, walletState: WalletStateStorage) => {
  const triggers = new Triggers();

  const sagaMiddleware = createSagaMiddleware();
  const storeMiddleware = [
    sagaMiddleware,
    thunkMiddleware.withExtraArgument({api: _api, backendApi, triggers})
  ];

  if (process.env.NODE_ENV === 'development') {
    storeMiddleware.push(reduxLogger);
  }

  const store = createReduxStore(
    rootReducer,
    applyMiddleware(...storeMiddleware)
  );

  sagaMiddleware.run(blockchains.sagas.root, backendApi);
  sagaMiddleware.run(addressBook.sagas.root, _api.vault);
  sagaMiddleware.run(tokens.sagas.root, backendApi);
  sagaMiddleware.run(hwkey.sagas.root, _api.vault);
  sagaMiddleware.run(txhistory.sagas.root, backendApi);
  sagaMiddleware.run(wallet.sagas.root);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(accounts.sagas.root, _api.vault, walletState);
  sagaMiddleware.run(hdpathPreview.sagas.root, _api.vault, backendApi);

  triggers.setStore(store);
  hwkey.triggers.run(triggers);
  hdpathPreview.triggers.run(triggers);

  return store;
};
