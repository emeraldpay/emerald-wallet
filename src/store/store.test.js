import { fromJS } from 'immutable';
import { createStore } from './store';
import Ledger from './ledger';
import Screen from './wallet/screen';
import WalletHistory from './wallet/history';

describe('store', () => {
  it('should create store with dependecy', () => {
    const store = createStore(null);
    expect(store).toBeDefined();
  });

  it('should dispatch ledger actions', () => {
    const store = createStore(null);
    store.dispatch(Ledger.actions.setWatch(true));
  });

  it('should dispatch screen actions', () => {
    const store = createStore(null);
    store.dispatch(Screen.actions.gotoScreen('create-tx', fromJS({id: '0x123', name: null})));
  });

  it('should dispatch tx history actions', () => {
    const store = createStore(null);
    store.dispatch(WalletHistory.actions.trackTx({hash: '0x12', to: null}));
    store.dispatch(Ledger.actions.setWatch(true));
  });
});
