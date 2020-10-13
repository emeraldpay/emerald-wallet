import * as React from 'react';
import {Provider} from 'react-redux';
import {createStore} from '@emeraldwallet/store';
import {ApiMock, BackendMock, VaultMock} from "./backendMock";
import {StoryContext, StoryFn} from "@storybook/addons/dist/types";
import {IApi, WalletStateStorage} from "@emeraldwallet/core";
import {WalletState} from '@emeraldpay/emerald-vault-core';
import {AddressRole, EntryId} from "@emeraldpay/emerald-vault-core/lib/types";

function createApi(backend: BackendMock): IApi {
  return new ApiMock(
    new VaultMock(backend.vault)
  )
}

class WalletStateMock implements WalletStateStorage {
  load(): Promise<WalletState> {
    return Promise.resolve({accountIndexes: []});
  }

  next(entryId: EntryId, type: AddressRole): Promise<WalletState> {
    return Promise.resolve({accountIndexes: []});
  }

  update(entryId: EntryId, receive: number | undefined, change: number | undefined): Promise<WalletState | undefined> {
    return Promise.resolve(undefined);
  }

}

const defaultBackend = new BackendMock();
const defaultWalletState = new WalletStateMock();
const defaultStore = createStore(createApi(defaultBackend), defaultBackend, defaultWalletState);


export function providerForStore(backend: BackendMock, init = []) {
  const store = createStore(createApi(backend), backend, defaultWalletState);
  init?.forEach((action) => store.dispatch(action));
  return (story: StoryFn, c: StoryContext) =>
    (<Provider store={store}>
      {story()}
    </Provider>)
    ;
}

const withProvider = (story) => (
  <Provider store={defaultStore}>
    {story()}
  </Provider>
);

export default withProvider;