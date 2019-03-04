import Immutable from 'immutable';
import accountReducers from './accountReducers';
import ActionTypes from './actionTypes';

describe('accountReducers', () => {
  it('should store hidden flag', () => {
    let state = accountReducers(null, {});
    // do
    state = accountReducers(state, {
      type: ActionTypes.SET_LIST,
      accounts: [{
        accountId: 'address',
        name: 'name1',
        description: 'desc1',
        hidden: true,
        hardware: false,
      }],
    });
    // assert
    expect(state.get('accounts').last().get('hardware')).toEqual(false);
    expect(state.get('accounts').last().get('hidden')).toEqual(true);
  });

  it('should set hd path', () => {
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

  it('should add only non existent account', () => {
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
