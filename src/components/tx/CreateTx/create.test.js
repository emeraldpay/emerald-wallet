import { fromJS } from 'immutable';
import { selectBalance, traceValidate } from './create';

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

describe('traceValidate', () => {
  it('should rejects if gas underestimated', () => {
    const tx = {
      gas: 21000,
    };
    const dispatch = (f) => Promise.resolve(f);
    const estimateGas = () => Promise.resolve(22000);

    return expect(traceValidate(tx, dispatch, estimateGas)).rejects.toBe('Insufficient Gas. Expected 22000');
  });
});
