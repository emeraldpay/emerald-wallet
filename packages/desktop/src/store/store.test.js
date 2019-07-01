import { fromJS } from 'immutable';
import { ledger } from '@emeraldwallet/store';
import { createStore } from './createStore';
import { screen } from './index';
import WalletHistory from './wallet/history';

describe('store', () => {
  it('should create store with dependecy', () => {
    const store = createStore(null);
    expect(store).toBeDefined();
  });

  it('should dispatch ledger actions', () => {
    const store = createStore(null);
    store.dispatch(ledger.actions.setWatch(true));
  });

  it('should dispatch screen actions', () => {
    const store = createStore(null);
    store.dispatch(screen.actions.gotoScreen('create-tx', fromJS({id: '0x123', name: null})));
  });

  it('should dispatch tx history actions', () => {
    const store = createStore(null);
    store.dispatch(WalletHistory.actions.trackTx({hash: '0x12', to: null}, 'etc'));
    store.dispatch(ledger.actions.setWatch(true));
  });
});
