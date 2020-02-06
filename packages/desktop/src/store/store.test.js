import { fromJS } from 'immutable';
import { ledger, screen } from '@emeraldwallet/store';
import { createStore } from './createStore';

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
    store.dispatch(ledger.actions.setWatch(true));
  });

  it('should dispatch screen actions', () => {
    const store = createStore(apiMock);
    store.dispatch(screen.actions.gotoScreen('create-tx', fromJS({id: '0x123', name: null})));
  });
});
