import { BackendApi, WalletApi } from '@emeraldwallet/core';
import { createStore, screen } from '@emeraldwallet/store';

const apiMock = {} as WalletApi;
const backendApiMock = {} as BackendApi;

describe('store', () => {
  it('should create store with dependency', () => {
    const store = createStore(apiMock, backendApiMock);

    expect(store).toBeDefined();
  });

  it('should dispatch screen actions', () => {
    const store = createStore(apiMock, backendApiMock);

    store.dispatch(screen.actions.gotoScreen('create-tx', { id: '0x123', name: null }));
  });
});
