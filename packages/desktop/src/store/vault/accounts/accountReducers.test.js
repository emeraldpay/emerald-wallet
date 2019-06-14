import Immutable from 'immutable';
import accountReducers from './accountReducers';
import ActionTypes from './actionTypes';

describe('accountReducers', () => {
  it('ADD_ACCOUNT should set hd path', () => {
    // prepare
    let state = accountReducers(null, {});
    expect(state.get('accounts')).toEqual(Immutable.List());
    state = accountReducers(state, {
      type: ActionTypes.ADD_ACCOUNT,
      accountId: 'id1',
      name: 'name1',
      description: 'desc1',
    });
    expect(state.get('accounts').size).toEqual(1);
    expect(state.get('accounts').last().get('id')).toEqual('id1');
    expect(state.get('accounts').last().get('name')).toEqual('name1');

    // do
    state = accountReducers(state, {
      type: ActionTypes.SET_HD_PATH,
      accountId: 'id1',
      hdpath: 'hdpath1',
    });

    // assert
    expect(state.get('accounts').size).toEqual(1);
    expect(state.get('accounts').last().get('id')).toEqual('id1');
    expect(state.get('accounts').last().get('name')).toEqual('name1');
    expect(state.get('accounts').last().get('hdpath')).toEqual('hdpath1');
  });

  it('ADD_ACCOUNT should add only non existent account', () => {
    let state = accountReducers(null, {});
    expect(state.get('accounts')).toEqual(Immutable.List());
    state = accountReducers(state, {
      type: ActionTypes.ADD_ACCOUNT,
      accountId: 'id1',
      name: 'name1',
      description: 'desc1',
      blockchain: 'etc',
    });
    expect(state.get('accounts').size).toEqual(1);
    expect(state.get('accounts').last().get('id')).toEqual('id1');
    expect(state.get('accounts').last().get('name')).toEqual('name1');
    expect(state.get('accounts').last().get('blockchain')).toEqual('etc');

    // add again
    state = accountReducers(state, {
      type: ActionTypes.ADD_ACCOUNT,
      accountId: 'id1',
      name: 'name1',
      description: 'desc1',
    });
    expect(state.get('accounts').size).toEqual(1);
  });
});
