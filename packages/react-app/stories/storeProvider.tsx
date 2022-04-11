import { WalletState } from '@emeraldpay/emerald-vault-core';
import { IApi, WalletStateStorage } from '@emeraldwallet/core';
import { createStore } from '@emeraldwallet/store';
import { DecoratorFunction } from '@storybook/addons/dist/ts3.9/types';
import * as React from 'react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { ApiMock, BackendMock, VaultMock } from './backendMock';

function createApi(backend: BackendMock): IApi {
  return new ApiMock(new VaultMock(backend.vault));
}

class WalletStateMock implements WalletStateStorage {
  load(): Promise<WalletState> {
    return Promise.resolve({ accountIndexes: [] });
  }

  next(): Promise<WalletState> {
    return Promise.resolve({ accountIndexes: [] });
  }

  update(): Promise<WalletState | undefined> {
    return Promise.resolve(undefined);
  }
}

const defaultBackend = new BackendMock();
const defaultWalletState = new WalletStateMock();
const defaultStore = createStore(createApi(defaultBackend), defaultBackend, defaultWalletState);

export function providerForStore(backend: BackendMock, init = []): DecoratorFunction<ReactElement> {
  const store = createStore(createApi(backend), backend, defaultWalletState);

  init?.forEach((action) => store.dispatch(action));

  // eslint-disable-next-line react/display-name
  return (story) => <Provider store={store}>{story()}</Provider>;
}

const withProvider: DecoratorFunction<ReactElement> = (story) => <Provider store={defaultStore}>{story()}</Provider>;

export default withProvider;
