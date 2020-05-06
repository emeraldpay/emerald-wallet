import { BlockchainCode } from '@emeraldwallet/core';
import * as actions from './actions';
import { INITIAL_STATE, reducer } from './reducer';

describe('add-account reducer', () => {
  it('should reset state on start', () => {
    let state = reducer(INITIAL_STATE, actions.start());
    state = reducer(state, actions.setBlockchain(BlockchainCode.ETH));
    expect(state.blockchain).toEqual(BlockchainCode.ETH);
    // do
    state = reducer(state, actions.start());
    expect(state.blockchain).toBeUndefined();
  });
});
