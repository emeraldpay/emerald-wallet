import { Wei } from '@emeraldplatform/eth';
import BigNumber from 'bignumber.js';
import { mount, shallow } from 'enzyme';
import { fromJS } from 'immutable';
import * as React from 'react';
import { Provider } from 'react-redux';
import { AnyAction, Store } from 'redux';
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
        launcher: fromJS({
          geth: {}
        }),
        network: fromJS({
          chain: {}
        }),
        wallet: {
          settings: fromJS({
            localeCurrency: 'USD',
            rates: {
              ETH: '234.56',
              ETC: '7.89'
            }
          })
        },
        addresses: fromJS({
          addresses: [
            { balance: new Wei(1000000000000000), blockchain: 'eth' },
            { balance: new Wei(2000000000000000), blockchain: 'eth' },
            { balance: new Wei(3000000000000000), blockchain: 'etc' }
          ]
        })
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
    expect(component.find(Total).children().first().props().total).toEqual(new BigNumber('0.72'));
  });
});
