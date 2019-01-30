
import { fromJS, Map } from 'immutable';
import BigNumber from 'bignumber.js';
import { balanceByTokenSymbol } from './selectors';
import reducer from './tokenReducers';
import ActionTypes from './actionTypes';
import TokenUnits from '../../../lib/tokenUnits';

const state = fromJS({
  tokens: [{ symbol: 'BEC', address: '0xBECBECBEC', name: 'BitEther' }],
  balances: new Map(),
  loading: false,
});


describe('tokens selectors', () => {
  describe('balanceByTokenSymbol', () => {
    it('should work', () => {
      // prepare
      const newState = reducer(state, {
        type: ActionTypes.SET_TOKEN_BALANCE,
        accountId: '0x123456',
        token: { address: '0xBECBECBEC', symbol: 'BEC' },
        value: 976,
      });
      // do
      const balance = balanceByTokenSymbol(newState, 'BEC', '0x123456');
      // assert
      expect(balance).toEqual(new TokenUnits(new BigNumber(976), 0));
    });
  });
});
