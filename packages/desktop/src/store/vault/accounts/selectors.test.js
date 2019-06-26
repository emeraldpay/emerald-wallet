import { fromJS } from 'immutable';
import { Wei } from '@emeraldplatform/eth';

import { selectTotalBalance, selectAccount } from './selectors';

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

describe('selectTotalBalance', () => {
  it('returns zero if no accounts', () => {
    const state = {
      addresses: fromJS({
        addresses: [],
      }),
    };

    const total = selectTotalBalance('eth', state);
    expect(total).toEqual(Wei.ZERO);
  });

  it('returns account balance if there is only one', () => {
    const state = {
      addresses: fromJS({
        addresses: [{
          balance: new Wei(1234),
          blockchain: 'etc',
        }],
      }),
    };

    const total = selectTotalBalance('etc', state);
    expect(total.equals(new Wei(1234))).toBeTruthy();
  });

  it('returns sum of balances', () => {
    const state = {
      addresses: fromJS({
        addresses: [{
          balance: new Wei(1234),
          blockchain: 'eth',
        },
        {
          balance: new Wei(11),
          blockchain: 'eth',
        }],
      }),
    };

    const total = selectTotalBalance('eth', state);
    expect(total.equals(new Wei(1245))).toBeTruthy();
  });

  it('returns sum of balances for selected chain only', () => {
    const state = {
      addresses: fromJS({
        addresses: [{
          balance: new Wei(1234),
          blockchain: 'eth',
        },
        {
          balance: new Wei(51),
          blockchain: 'etc',
        },
        {
          balance: new Wei(11),
          blockchain: 'eth',
        }],
      }),
    };

    const total = selectTotalBalance('eth', state);
    expect(total.equals(new Wei(1245))).toBeTruthy();

    const totalEtc = selectTotalBalance('etc', state);
    expect(totalEtc.equals(new Wei(51))).toBeTruthy();
  });
});
