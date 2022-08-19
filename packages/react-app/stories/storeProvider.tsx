import { WalletApi } from '@emeraldwallet/core';
import { createStore } from '@emeraldwallet/store';
import { DecoratorFunction } from '@storybook/addons/dist/ts3.9/types';
import * as React from 'react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { AddressBookMock, ApiMock, BackendMock, TxHistoryMock, VaultMock, XPubPosMock } from './backendMock';

function createApi(backend: BackendMock): WalletApi {
  return new ApiMock(
    new AddressBookMock(backend.addressBook),
    new TxHistoryMock(backend.txHistory),
    new VaultMock(backend.vault),
    new XPubPosMock(backend.xPubPos),
  );
}

const defaultBackend = new BackendMock();

const defaultStore = createStore(createApi(defaultBackend), defaultBackend);

export function providerForStore(backend: BackendMock, init = []): DecoratorFunction<ReactElement> {
  const store = createStore(createApi(backend), backend);

  init?.forEach((action) => store.dispatch(action));

  return (story) => <Provider store={store}>{story()}</Provider>;
}

const withProvider: DecoratorFunction<ReactElement> = (story) => <Provider store={defaultStore}>{story()}</Provider>;

export default withProvider;
