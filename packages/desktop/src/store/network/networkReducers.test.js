import networkReducer from './networkReducers';
import ActionTypes from './actionTypes';

describe('networkReducer', () => {
  it('should clear sync data after chain switching', () => {
    let state = networkReducer(null, {});
    expect(state.getIn(['sync', 'highestBlock'])).toEqual(null);
    state = networkReducer(state, {
      type: ActionTypes.SYNCING,
      syncing: true,
      status: {
        startingBlock: 0,
        currentBlock: 1,
        highestBlock: 100,
      },
    });
    expect(state.getIn(['sync', 'highestBlock'])).toEqual(100);

    // do
    state = networkReducer(state, {
      type: ActionTypes.SWITCH_CHAIN,
      chain: 'mainnet',
      chainId: 61,
    });

    // assert
    expect(state.getIn(['sync', 'highestBlock'])).toEqual(null);
  });
});
