import { WalletApi } from '@emeraldwallet/core';
import { Dispatched, createStore } from '@emeraldwallet/store';
import * as React from 'react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { AnyAction } from 'redux';
import { ApiMock, MemoryApiMock } from './__mocks__';
import { BackendMock } from './__mocks__';
import {
  AddressBookMock,
  AllowancesMock,
  BalancesMock,
  CacheMock,
  TxHistoryMock,
  TxMetaMock,
  XPubPosMock,
} from './__mocks__';
import { VaultMock } from './__mocks__';
import { DecoratorFunction } from '@storybook/types';

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
  actions: Array<AnyAction | Dispatched> = [],
): DecoratorFunction {
  const store = createStore(createApi(api), backend);

  actions?.forEach((action) => store.dispatch(action as AnyAction));

  return (story, context) => {
    let extraActions = context.args["_test_actions"] as Array<AnyAction | Dispatched> || [];
    extraActions.forEach((action) => store.dispatch(action as AnyAction));

    return (<Provider store={store}>{story()}</Provider>);
  };
}

const defaultBackend = new BackendMock();
export const defaultStore = createStore(createApi(new MemoryApiMock()), defaultBackend);

const withProvider: DecoratorFunction = (story) => <Provider store={defaultStore}>{story()}</Provider>;

export default withProvider;
