import { Units, Wei } from '@emeraldplatform/eth';
import { INITIAL_STATE, reducer } from './reducer';
import * as selectors from './selectors';
import { ActionTypes, moduleName } from './types';

describe('blockchains reducer', () => {
  it('handles Actions.BLOCK', () => {
    let state = reducer(undefined, { type: ActionTypes.BLOCK, payload: { chain: 'etc', height: 112 } });
    expect(state).toEqual(INITIAL_STATE.set('etc', { gasPrice: new Wei(0), height: 112 }));
    state = reducer(state, { type: ActionTypes.BLOCK, payload: { chain: 'etc', height: 114 } });
    expect(state).toEqual(INITIAL_STATE.set('etc', { gasPrice: new Wei(0), height: 114 }));
  });

  it('handles Actions.GAS_PRICE', () => {
    const state = reducer(undefined, { type: ActionTypes.GAS_PRICE, payload: { blockchain: 'etc', gasPrice: new Wei(850000) } });
    expect(state).toEqual(INITIAL_STATE.set('etc', { gasPrice: new Wei(850000), height: null }));
    expect(selectors.gasPrice({ [moduleName]: state }, 'etc').toString(Units.WEI)).toEqual('850000');
  });
});
