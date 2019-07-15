import {fromJS} from "immutable";
import {Wei} from "@emeraldplatform/eth";
import { selectTotalBalance } from './selectors';

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
