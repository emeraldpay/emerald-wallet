import {accounts} from '@emeraldwallet/store';
import {mount} from 'enzyme';
import * as React from 'react';
import {Provider} from 'react-redux';
import Total from './Total';
import {Wallet} from '@emeraldpay/emerald-vault-core';
import {Wei} from "@emeraldpay/bigamount-crypto";
import {CurrencyAmount} from "@emeraldwallet/core";

const NO_ADDRESS = {
  type: 'single', value: ''
}

function createStore() {
  return {
    dispatch() {
    },
    subscribe() {
      return () => {
      };
    },
    replaceReducer() {
    },
    getState() {
      return {
        launcher: {
          geth: {}
        },
        network: {
          chain: {}
        },
        settings: {
          localeCurrency: 'USD',
          rates: {
            ETH: '234.56',
            ETC: '7.89'
          }
        },
        tokens: {},
        [accounts.moduleName]: {
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
          ] as Wallet[],
          details: [
            {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1000000000000000).encode()},
            {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(0).encode()},
            {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(0).encode()},
            {entryId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', balance: new Wei(2000000000000000).encode()},
            {entryId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', balance: new Wei(3000000000000000).encode()}
          ]
        }
      };
    }
  };
}

describe('Header/Total', () => {
  it('renders total balance from store', () => {
    const component = mount(<Provider store={createStore() as any}><Total/></Provider>);
    // ETH
    // (1000000000000000 + 2000000000000000) / 10^18 × 234.56
    // = 0.70368
    // ETC
    // 3000000000000000 / 10^18 × 7.89
    // = 0.02367
    // 0.70368 + 0.02367
    // = 0.72735
    expect(component.find(Total).children().first().props().total.toString())
      .toEqual(CurrencyAmount.create(0.72735, "USD").toString());
  });
});
