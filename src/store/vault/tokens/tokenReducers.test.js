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

  it('should update zero token balance, symbol and decimals', () => {
    // prepare
    let state = reducer(null, {});

    // do - update balance only, without symbol
    state = reducer(state, {
      type: ActionTypes.SET_TOKEN_BALANCE,
      accountId: 'id1',
      token: {
        address: '0x2',
        decimals: '0x2',
      },
      value: '0x1',
    });
    console.log(JSON.stringify(state));
    // assert
    expect(state.get('balances').get('id1').first().get('balance').value).toEqual(new BigNumber(1));

    // do - update balance with symbol
    state = reducer(state, {
      type: ActionTypes.SET_TOKEN_BALANCE,
      accountId: 'id1',
      token: {
        address: '0x2',
        decimals: '0x2',
        symbol: 'BEC',
      },
      value: '0x2',
    });
    console.log(JSON.stringify(state));
    expect(state.get('balances').get('id1').first().get('symbol')).toEqual('BEC');
  });
});
