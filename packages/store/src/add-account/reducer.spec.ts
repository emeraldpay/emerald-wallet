import { BlockchainCode } from '@emeraldwallet/core';
import * as actions from './actions';
import { INITIAL_STATE, reducer } from './reducer';

describe('add-account reducer', () => {
  it('should reset state on start', () => {
    let state = reducer(INITIAL_STATE, actions.start('wallet-1'));
    state = reducer(state, actions.setBlockchain(BlockchainCode.ETH));
    expect(state.walletId).toEqual('wallet-1');
    expect(state.blockchain).toEqual(BlockchainCode.ETH);
    // do
    state = reducer(state, actions.start('wallet-2'));
    expect(state.walletId).toEqual('wallet-2');
    expect(state.blockchain).toBeUndefined();
  });
});
