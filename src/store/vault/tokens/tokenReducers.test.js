import { fromJS } from 'immutable';
import BigNumber from 'bignumber.js';
import reducer from './tokenReducers';
import ActionTypes from './actionTypes';

describe('tokenReducer', () => {
  it('ADD_TOKEN should not add same token twice', () => {
    // prepare
    let state = reducer(null, {});

    state = reducer(state, {
      type: ActionTypes.ADD_TOKEN,
      address: '0x1',
      name: 'n1',
    });

    // do
    state = reducer(state, {
      type: ActionTypes.ADD_TOKEN,
      address: '0x1',
      name: 'n1',
    });

    // assert
    expect(state.get('tokens').size).toEqual(1);
  });

  it('should update balances of provided tokens on SET_TOKENS_BALANCES', () => {
    // prepare
    let state = reducer(null, {});
    state = reducer(state, {
      type: ActionTypes.ADD_TOKEN,
      address: '0x1123',
      name: 'Token1',
      symbol: 'TKN',
    });

    // do
    state = reducer(state, {
      type: ActionTypes.SET_TOKENS_BALANCES,
      tokenBalances: [{ accountAddress: '0x123456789', tokenAddress: '0x1123', amount: '0x01'}],
    });

    // assert
    expect(state.toJS().balances['0x123456789'][0].balance.value).toEqual(new BigNumber(1));
  });

  it('requires token data for SET_TOKEN_BALANCE', () => {
    // prepare
    const state = reducer(null, {});
    return expect(() => reducer(state, {
      type: ActionTypes.SET_TOKEN_BALANCE,
      accountId: 'id1',
      value: '0x1',
    })).toThrow();
  });

  it('SET_TOKEN_BALANCE should update zero token balance, symbol and decimals', () => {
    // prepare
    let state = reducer(null, {});

    // do - update balance only, without symbol
    state = reducer(state, {
      type: ActionTypes.SET_TOKEN_BALANCE,
      accountId: 'id1',
      token: fromJS({
        address: '0x2',
        decimals: '0x2',
        symbol: 'BEC',
      }),
      value: '0x1',
    });

    // assert
    expect(state.get('balances').get('id1').first().get('balance').value).toEqual(new BigNumber(1));

    // do - update balance with symbol
    state = reducer(state, {
      type: ActionTypes.SET_TOKEN_BALANCE,
      accountId: 'id1',
      token: fromJS({
        address: '0x2',
        decimals: '0x2',
        symbol: 'BEC',
      }),
      value: '0x2',
    });
    expect(state.get('balances').get('id1').first().get('symbol')).toEqual('BEC');
  });
});
