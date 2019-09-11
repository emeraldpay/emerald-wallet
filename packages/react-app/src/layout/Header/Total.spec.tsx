import * as React from 'react';
import { Wei } from '@emeraldplatform/eth';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import BigNumber from 'bignumber.js';
import Total from './Total';
import {AnyAction, Store} from 'redux';

function createStore() {
  return {
    dispatch() {},
    subscribe() {
      return () => {}
    },
    replaceReducer() {},
    getState() {
      return {
        launcher: fromJS({
          geth: {},
        }),
        network: fromJS({
          chain: {},
        }),
        wallet: {
          settings: fromJS({
            localeCurrency: 'USD',
            rates: {
              ETH: '234.56',
              ETC: '7.89',
            },
          }),
        },
        addresses: fromJS({
          addresses: [
            {balance: new Wei(1000000000000000), blockchain: 'eth'},
            {balance: new Wei(2000000000000000), blockchain: 'eth'},
            {balance: new Wei(3000000000000000), blockchain: 'etc'},
          ],
        }),
      };
    },
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
