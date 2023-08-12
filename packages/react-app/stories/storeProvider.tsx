import { WalletApi } from '@emeraldwallet/core';
import { createStore } from '@emeraldwallet/store';
import { Dispatched } from '@emeraldwallet/store/lib/types';
import { DecoratorFunction } from '@storybook/addons/dist/ts3.9/types';
import * as React from 'react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { Action } from 'redux';
import { ApiMock, MemoryApiMock } from './__mocks__/apiMock';
import { BackendMock } from './__mocks__/backendMock';
import {
  AddressBookMock,
  AllowancesMock,
  BalancesMock,
  CacheMock,
  TxHistoryMock,
  TxMetaMock,
  XPubPosMock,
} from './__mocks__/persistentStateMock';
import { VaultMock } from './__mocks__/vaultMock';

function createApi(api: MemoryApiMock): WalletApi {
  return new ApiMock(
    new AddressBookMock(api.addressBook),
    new AllowancesMock(api.allowances),
    new BalancesMock(api.balances),
    new CacheMock(api.cache),
    new TxHistoryMock(api.txHistory),
    new TxMetaMock(api.txMeta),
    new VaultMock(api.vault),
    new XPubPosMock(api.xPubPos),
  );
}

export function providerForStore(
  api: MemoryApiMock,
  backend: BackendMock,
  actions: Array<Action | Dispatched> = [],
): DecoratorFunction<ReactElement> {
  const store = createStore(createApi(api), backend);

  actions?.forEach((action) => store.dispatch(action as Action));

  return (story) => <Provider store={store}>{story()}</Provider>;
}

const defaultBackend = new BackendMock();
const defaultStore = createStore(createApi(new MemoryApiMock()), defaultBackend);

const withProvider: DecoratorFunction<ReactElement> = (story) => <Provider store={defaultStore}>{story()}</Provider>;

export default withProvider;
