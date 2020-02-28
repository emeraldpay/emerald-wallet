import { reducer } from './reducer';
import * as selectors from './selectors';
import { ActionTypes } from './types';

describe('blockchain selectors', () => {
  it('all should return map', () => {

    let state = reducer(undefined, { type: ActionTypes.BLOCK, payload: { blockchain: 'etc', height: 112 } });
    state = reducer(state, { type: ActionTypes.BLOCK, payload: { blockchain: 'eth', height: 2112 } });
    const globalState = {
      blockchains: state
    };

    const result = selectors.all(globalState);
    expect(result.keys()).toBeDefined();
    result.forEach((v, k) => {
      expect(result.get(k)).toEqual(v);
    });
  });
});
