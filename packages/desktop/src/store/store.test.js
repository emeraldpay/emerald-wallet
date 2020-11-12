import {fromJS} from 'immutable';
import {screen, createStore, hwkey} from '@emeraldwallet/store';

const apiMock = {
  vault: {}
};

describe('store', () => {
  it('should create store with dependency', () => {
    const store = createStore(apiMock);
    expect(store).toBeDefined();
  });

  it('should dispatch ledger actions', () => {
    const store = createStore(apiMock);
    store.dispatch(hwkey.actions.setWatch(true));
  });

  it('should dispatch screen actions', () => {
    const store = createStore(apiMock);
    store.dispatch(screen.actions.gotoScreen('create-tx', fromJS({id: '0x123', name: null})));
  });
});
