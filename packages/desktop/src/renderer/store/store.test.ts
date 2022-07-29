import { IBackendApi, WalletApi, WalletStateStorage } from '@emeraldwallet/core';
import { createStore, screen } from '@emeraldwallet/store';

const apiMock = {} as WalletApi;
const backendApiMock = {} as IBackendApi;
const walletStateMock = {} as WalletStateStorage;

describe('store', () => {
  it('should create store with dependency', () => {
    const store = createStore(apiMock, backendApiMock, walletStateMock);

    expect(store).toBeDefined();
  });

  it('should dispatch screen actions', () => {
    const store = createStore(apiMock, backendApiMock, walletStateMock);

    store.dispatch(screen.actions.gotoScreen('create-tx', { id: '0x123', name: null }));
  });
});
