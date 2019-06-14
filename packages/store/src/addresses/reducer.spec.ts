import { fromJS } from 'immutable';
import { ActionTypes } from './types';
import { reducer, INITIAL_STATE } from "./reducer";

describe('addresses reducer', () => {
  it('handles Actions.LOADING', () => {

    const state = reducer(undefined, { type: ActionTypes.LOADING });
    expect(state).toEqual(fromJS({
      ...(INITIAL_STATE.toJS()),
      loading: true,
    }));
  });

  it('SET_LIST should store addresses correctly', () => {
    // do
    let state: any = reducer(undefined, {
      type: ActionTypes.SET_LIST,
      payload: [{
        accountId: 'address',
        name: 'name1',
        description: 'desc1',
        hidden: true,
        hardware: false,
        blockchain: 'etc',
      }],
    });
    // assert
    expect(state.get('addresses').last().get('hardware')).toEqual(false);
    expect(state.get('addresses').last().get('hidden')).toEqual(true);
    expect(state.get('addresses').last().get('blockchain')).toEqual('etc');
  });
});
