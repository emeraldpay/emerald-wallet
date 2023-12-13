import { BackendApi, WalletApi } from '@emeraldwallet/core';
import { createStore, screen } from '@emeraldwallet/store';

const apiMock = {} as WalletApi;
const backendApiMock = {} as BackendApi;

describe('store', () => {
  it('should create store', () => {
    const store = createStore(apiMock, backendApiMock);

    expect(store).toBeDefined();
  });

  it('should dispatch screen action', () => {
    const store = createStore(apiMock, backendApiMock);

    store.dispatch(
      screen.actions.gotoScreen(screen.Pages.CREATE_TX, { walletId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee' }),
    );
  });
});
