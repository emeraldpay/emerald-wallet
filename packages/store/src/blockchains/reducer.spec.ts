import { ActionTypes } from './types';
import { reducer, INITIAL_STATE } from "./reducer";

describe('blockchains reducer', () => {
  it('handles Actions.BLOCK', () => {
    let state = reducer(undefined, { type: ActionTypes.BLOCK, payload: {chain: "etc", height: 112 } });
    expect(state).toEqual(INITIAL_STATE.set("etc", { gasPrice: 0, height: 112 }));
    state = reducer(state, { type: ActionTypes.BLOCK, payload: {chain: "etc", height: 114 } });
    expect(state).toEqual(INITIAL_STATE.set("etc", { gasPrice: 0, height: 114 }));
  });

  it('handles Actions.GAS_PRICE', () => {
    let state = reducer(undefined, { type: ActionTypes.GAS_PRICE, payload: {chain: "etc", gasPrice: 850000 } });
    expect(state).toEqual(INITIAL_STATE.set("etc", { gasPrice: 850000, height: null }));
  })
});
