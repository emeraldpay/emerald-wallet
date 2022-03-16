import { IApi, IBackendApi, WalletStateStorage } from '@emeraldwallet/core';
import { createStore, screen } from '@emeraldwallet/store';
import { fromJS } from 'immutable';

const apiMock = {} as IApi;
const backendApiMock = {} as IBackendApi;
const walletStateMock = {} as WalletStateStorage;

describe('store', () => {
  it('should create store with dependency', () => {
    const store = createStore(apiMock, backendApiMock, walletStateMock);

    expect(store).toBeDefined();
  });

  it('should dispatch screen actions', () => {
    const store = createStore(apiMock, backendApiMock, walletStateMock);

    store.dispatch(screen.actions.gotoScreen('create-tx', fromJS({ id: '0x123', name: null })));
  });
});
