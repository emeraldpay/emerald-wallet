import { fromJS } from 'immutable';
import { Wei } from '@emeraldplatform/emerald-js';

import { selectTotalBalance, selectAccount } from './selectors';

describe('selectAccount', () => {
  it('should handle checksumed address', () => {
    const addr = '0x93Bf3B39AcaCd8992a31181d985541B368A5307d';
    const state = {
      accounts: fromJS({
        accounts: [{
          id: addr.toLowerCase(),
        }],
      }),
    };
    const acc = selectAccount(state, addr);
    expect(acc).toBeDefined();
  });
});

describe('selectTotalBalance', () => {
  it('returns zero if no accounts', () => {
    const state = {
      accounts: fromJS({
        accounts: [],
      }),
    };

    const total = selectTotalBalance(state);
    expect(total).toEqual(Wei.ZERO);
  });

  it('returns account balance if there is only one', () => {
    const state = {
      accounts: fromJS({
        accounts: [{
          balance: new Wei(1234),
        }],
      }),
    };

    const total = selectTotalBalance(state);
    expect(total.equals(new Wei(1234))).toBeTruthy();
  });

  it('returns sum of balances', () => {
    const state = {
      accounts: fromJS({
        accounts: [{
          balance: new Wei(1234),
        },
        {
          balance: new Wei(11),
        }],
      }),
    };

    const total = selectTotalBalance(state);
    expect(total.equals(new Wei(1245))).toBeTruthy();
  });
});
