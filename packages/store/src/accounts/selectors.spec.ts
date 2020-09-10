import {Wei} from '@emeraldplatform/eth';
import {BlockchainCode} from '@emeraldwallet/core';
import {IState} from '../types';
import {allAsArray, balanceByChain} from './selectors';
import {moduleName} from './types';

const NO_ADDRESS = {type: "single", value: ""};

describe('allAsArray', () => {
  const state = {
    [moduleName]: {
      wallets: [{
        id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
        accounts: []
      }]
    }
  };
  it('should returns array', () => {
    // @ts-ignore
    const result = allAsArray(state);
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual('f692dcb6-74ea-4583-8ad3-fd13bb6c38ee');
  });
});

describe('selectTotalBalance', () => {
  it('returns zero if no accounts', () => {
    const state = {
      [moduleName]: {
        wallets: []
      }
    };

    // @ts-ignore
    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total).toEqual(Wei.ZERO);
  });

  it('returns account balance if there is only one', () => {
    const state = {
      [moduleName]: {
        wallets: [{
          id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
          entries: [
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 10002, address: NO_ADDRESS}
          ]
        }],
        details: [
          { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).value.toString() }
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.Kovan);
    expect(total.equals(new Wei(1234))).toBeTruthy();
  });

  it('returns sum of balances for one wallet', () => {
    const state = {
      [moduleName]: {
        wallets: [{
          id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
          entries: [
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: NO_ADDRESS},
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: NO_ADDRESS},
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: NO_ADDRESS}
          ]
        }],
        details: [
          { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).value.toString() },
          { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(11).value.toString() },
          { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(52).value.toString() }
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.toEther(18)).toEqual('0.000000000000001245');
  });

  it('returns sum of balances for two wallets', () => {
    const state = {
      [moduleName]: {
        wallets: [
          {
            id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
            entries: [
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: NO_ADDRESS},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: NO_ADDRESS},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: NO_ADDRESS}
            ]
          },
          {
            id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c',
            entries: [
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', blockchain: 100, address: NO_ADDRESS},
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', blockchain: 101, address: NO_ADDRESS}
            ]
          }
        ],
        details: [
          { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).value.toString() },
          { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(11).value.toString() },
          { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(52).value.toString() },
          { accountId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', balance: new Wei(200).value.toString() },
          { accountId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', balance: new Wei(302).value.toString() }
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.toEther(18)).toEqual('0.000000000000001445');
  });

});
