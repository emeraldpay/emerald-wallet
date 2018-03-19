import { fromJS } from 'immutable';
import { selectBalance } from './create';

test('It can select without an account balance', () => {
  const account = fromJS({
    id: '0x1234',
  });
  const state = {
    account,
    tokens: fromJS({}),
  };
  const result = selectBalance(state, account);
  expect(result).toEqual({symbol: 'ETC'});
});
