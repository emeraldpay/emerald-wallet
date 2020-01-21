import { Wei } from '@emeraldplatform/eth';
import { BlockchainCode } from '@emeraldwallet/core';
import { allAsArray, balanceByChain } from './selectors';
import {IAccountsState} from "./types";
import {IState} from "../types";

describe('allAsArray', () => {
  const state = {
    addresses: {
      wallets: [{
        id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
        accounts: [],
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
      addresses: {
        wallets: []
      }
    };

    // @ts-ignore
    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total).toEqual(Wei.ZERO);
  });

  it('returns account balance if there is only one', () => {
    const state = {
      addresses: {
        wallets: [{
          id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
          accounts: [
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 101, address: ""}
          ]
        }],
        details: [
          {accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).value.toString()}
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETC);
    expect(total.equals(new Wei(1234))).toBeTruthy();
  });

  it('returns sum of balances for one wallet', () => {
    const state = {
      addresses: {
        wallets: [{
          id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
          accounts: [
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: ""},
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: ""},
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: ""},
          ]
        }],
        details: [
          {accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).value.toString()},
          {accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(11).value.toString()},
          {accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(52).value.toString()}
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.toEther(18)).toEqual("0.000000000000001245")
  });

  it('returns sum of balances for two wallets', () => {
    const state = {
      addresses: {
        wallets: [
          {
            id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
            accounts: [
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: ""},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: ""},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: ""},
            ]
          },
          {
            id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c',
            accounts: [
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', blockchain: 100, address: ""},
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', blockchain: 101, address: ""},
            ]
          },
        ],
        details: [
          {accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).value.toString()},
          {accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(11).value.toString()},
          {accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(52).value.toString()},
          {accountId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', balance: new Wei(200).value.toString()},
          {accountId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', balance: new Wei(302).value.toString()}
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.toEther(18)).toEqual("0.000000000000001445")
  });

});
