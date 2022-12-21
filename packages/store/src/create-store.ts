import { BackendApi, WalletApi } from '@emeraldwallet/core';
import { Store, applyMiddleware, createStore as createReduxStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import { Triggers } from './triggers';
import { accounts, addressBook, hdpathPreview, hwkey, reduxLogger, rootReducer, settings, tokens, wallet } from './';

/**
 * Creates Redux store with API as dependency injection.
 *
 * Injecting api allows to write unit tests.
 *
 */
export const createStore = (api: WalletApi, backendApi: BackendApi): Store => {
  const triggers = new Triggers();

  const sagaMiddleware = createSagaMiddleware();
  const storeMiddleware = [sagaMiddleware, thunkMiddleware.withExtraArgument({ api, backendApi, triggers })];

  if (process.env.NODE_ENV === 'development') {
    storeMiddleware.push(reduxLogger);
  }

  const store = createReduxStore(rootReducer, applyMiddleware(...storeMiddleware));

  sagaMiddleware.run(addressBook.sagas.root, api.addressBook, api.vault);
  sagaMiddleware.run(tokens.sagas.root, backendApi);
  sagaMiddleware.run(hwkey.sagas.root, api.vault);
  sagaMiddleware.run(wallet.sagas.root);
  sagaMiddleware.run(settings.sagas.root);
  sagaMiddleware.run(accounts.sagas.root, api.vault, api.xPubPos);
  sagaMiddleware.run(hdpathPreview.sagas.root, api.vault, backendApi);

  triggers.setStore(store);

  hwkey.triggers.run(triggers);
  hdpathPreview.triggers.run(triggers);

  return store;
};
