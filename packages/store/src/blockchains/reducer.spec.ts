import { Actions } from './types';
import { reducer, INITIAL_STATE } from "./reducer";

describe('blockchains reducer', () => {
  it('handles Actions.BLOCK', () => {
    let state = reducer(undefined, { type: Actions.BLOCK, payload: {chain: "etc", height: 112 } });
    expect(state).toEqual(INITIAL_STATE.set("etc", { height: 112 }));
    state = reducer(state, { type: Actions.BLOCK, payload: {chain: "etc", height: 114 } });
    expect(state).toEqual(INITIAL_STATE.set("etc", { height: 114 }));
  });
});
