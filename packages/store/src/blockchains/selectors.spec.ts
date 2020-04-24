import { BlockchainCode } from '@emeraldwallet/core';
import { INITIAL_STATE, reducer } from './reducer';
import * as selectors from './selectors';
import { ActionTypes } from './types';

describe('blockchain selectors', () => {
  it('all should return map', () => {

    let state = reducer(INITIAL_STATE, { type: ActionTypes.BLOCK, payload: { blockchain: 'etc', height: 112 } });
    state = reducer(state, { type: ActionTypes.BLOCK, payload: { blockchain: 'eth', height: 2112 } });
    const globalState = {
      blockchains: state
    };

    const result = selectors.all(globalState);
    expect(result[BlockchainCode.ETC].height).toEqual(112);
  });
  describe('getCurrentInfo', () => {
    it('should return correct current info', () => {
      const state = reducer(INITIAL_STATE, { type: ActionTypes.BLOCK, payload: { blockchain: 'etc', height: 112 } });
      const globalState = {
        blockchains: state
      };
      const result = selectors.getCurrentInfo(globalState);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 'etc', title: 'etc', height: 112 });
    });
  });
});
