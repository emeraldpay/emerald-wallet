import {fromJS} from 'immutable';
import {ActionTypes} from './types';
import {INITIAL_STATE, reducer} from "./reducer";

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

  it('ADD_ACCOUNT should add only non existent account', () => {
    let state: any = reducer(undefined, { type: ActionTypes.LOADING });
    expect(state.get('addresses').size).toEqual(0);
    state = reducer(state, {
      type: ActionTypes.ADD_ACCOUNT,
      accountId: 'id1',
      name: 'name1',
      description: 'desc1',
      blockchain: 'etc',
    });
    expect(state.get('addresses').size).toEqual(1);
    expect(state.get('addresses').last().get('id')).toEqual('id1');
    expect(state.get('addresses').last().get('name')).toEqual('name1');
    expect(state.get('addresses').last().get('blockchain')).toEqual('etc');

    // add again
    state = reducer(state, {
      type: ActionTypes.ADD_ACCOUNT,
      accountId: 'id1',
      name: 'name1',
      description: 'desc1',
      blockchain: 'etc',
    });
    expect(state.get('addresses').size).toEqual(1);
  });

  it('ADD_ACCOUNT should add same account for another chain', () => {
    let state: any = reducer(undefined, { type: ActionTypes.LOADING });
    expect(state.get('addresses').size).toEqual(0);
    state = reducer(state, {
      type: ActionTypes.ADD_ACCOUNT,
      accountId: 'id1',
      name: 'name1',
      description: 'desc1',
      blockchain: 'etc',
    });
    expect(state.get('addresses').size).toEqual(1);
    expect(state.get('addresses').last().get('id')).toEqual('id1');
    expect(state.get('addresses').last().get('name')).toEqual('name1');
    expect(state.get('addresses').last().get('blockchain')).toEqual('etc');

    // add again
    state = reducer(state, {
      type: ActionTypes.ADD_ACCOUNT,
      accountId: 'id1',
      name: 'name1',
      description: 'desc1',
      blockchain: 'eth',
    });
    expect(state.get('addresses').size).toEqual(2);
  });

});
