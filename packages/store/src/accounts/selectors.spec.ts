import { Wei } from '@emeraldplatform/eth';
import { BlockchainCode } from '@emeraldwallet/core';
import { fromJS } from 'immutable';
import { balanceByChain } from './selectors';

describe('selectTotalBalance', () => {
  it('returns zero if no accounts', () => {
    const state = {
      addresses: fromJS({
        addresses: []
      })
    };

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total).toEqual(Wei.ZERO);
  });

  it('returns account balance if there is only one', () => {
    const state = {
      addresses: fromJS({
        addresses: [{
          balance: new Wei(1234),
          blockchain: 'etc'
        }]
      })
    };

    const total = balanceByChain(state, BlockchainCode.ETC);
    expect(total.equals(new Wei(1234))).toBeTruthy();
  });

  it('returns sum of balances', () => {
    const state = {
      addresses: fromJS({
        addresses: [{
          balance: new Wei(1234),
          blockchain: 'eth'
        },
          {
            balance: new Wei(11),
            blockchain: 'eth'
          }]
      })
    };

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.equals(new Wei(1245))).toBeTruthy();
  });

  it('returns sum of balances for selected chain only', () => {
    const state = {
      addresses: fromJS({
        addresses: [{
          balance: new Wei(1234),
          blockchain: 'eth'
        },
          {
            balance: new Wei(51),
            blockchain: 'etc'
          },
          {
            balance: new Wei(11),
            blockchain: 'eth'
          }]
      })
    };

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.equals(new Wei(1245))).toBeTruthy();

    const totalEtc = balanceByChain(state, BlockchainCode.ETC);
    expect(totalEtc.equals(new Wei(51))).toBeTruthy();
  });
});
