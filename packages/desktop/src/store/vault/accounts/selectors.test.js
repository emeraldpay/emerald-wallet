import { fromJS } from 'immutable';

import { selectAccount } from './selectors';

describe('selectAccount', () => {
  it('should handle checksumed address', () => {
    const addr = '0x93Bf3B39AcaCd8992a31181d985541B368A5307d';
    const state = {
      addresses: fromJS({
        addresses: [{
          id: addr.toLowerCase(),
        }],
      }),
    };
    const acc = selectAccount(state, addr);
    expect(acc).toBeDefined();
  });
});
