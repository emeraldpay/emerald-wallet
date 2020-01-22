import { Wei } from '@emeraldplatform/eth';
import { Units } from '@emeraldwallet/core';
import { addresses } from '@emeraldwallet/store';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import Total from './Total';

function createStore () {
  return {
    dispatch () {},
    subscribe () {
      return () => {};
    },
    replaceReducer () {},
    getState () {
      return {
        launcher: {
          geth: {}
        },
        network: {
          chain: {}
        },
        wallet: {
          settings: {
            localeCurrency: 'USD',
            rates: {
              ETH: '234.56',
              ETC: '7.89'
            }
          }
        },
        tokens: {},
        [addresses.moduleName]: {
          wallets: [
            {
              id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
              accounts: [
                { id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: '' },
                { id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: '' },
                { id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: '' }
              ]
            },
            {
              id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c',
              accounts: [
                { id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', blockchain: 100, address: '' },
                { id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', blockchain: 101, address: '' }
              ]
            }
          ],
          details: [
            { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1000000000000000).value.toString() },
            { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(0).value.toString() },
            { accountId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(0).value.toString() },
            { accountId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', balance: new Wei(2000000000000000).value.toString() },
            { accountId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', balance: new Wei(3000000000000000).value.toString() }
          ]
        }
      };
    }
  };
}

describe('Header/Total', () => {
  it('renders total balance from store', () => {
    const component = mount(<Provider store={createStore() as any}><Total /></Provider>);
    // ETH
    // (1000000000000000 + 2000000000000000) / 10^18 × 234.56
    // = 0.70368
    // ETC
    // 3000000000000000 / 10^18 × 7.89
    // = 0.02367
    // 0.70368 + 0.02367
    // = 0.72735
    expect(component.find(Total).children().first().props().total).toEqual(new Units('0.72735', 0));
  });
});
