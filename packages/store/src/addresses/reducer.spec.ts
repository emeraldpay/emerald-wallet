import { Actions } from './types';
import { reducer, INITIAL_STATE } from "./reducer";


describe('addresses reducer', () => {
  it('handles Actions.LOADING', () => {

    const state = reducer(undefined, { type: Actions.LOADING });
    expect(state).toEqual({
      ...INITIAL_STATE,
      loading: true,
    });
  });
});
