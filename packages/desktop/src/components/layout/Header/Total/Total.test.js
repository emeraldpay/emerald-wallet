import React from 'react';
import { Wei } from '@emeraldplatform/eth';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import Total from './Total';

function createStore() {
  return {
    dispatch() {},
    subscribe() {},
    getState() {
      return {
        launcher: fromJS({
          geth: {},
        }),
        network: fromJS({
          chain: {},
        }),
        wallet: {
          settings: fromJS({}),
        },
        accounts: fromJS({
          accounts: [
            {balance: new Wei(1000000000000000)},
            {balance: new Wei(2000000000000000)},
          ],
        }),
      };
    },
  };
}

describe('Header/Total', () => {
  it('renders total balance from store', () => {
    const component = mount(<Provider store={createStore()}><Total /></Provider>);
    expect(component.find(Total).children().first().props().total).toEqual('0.003');
  });
});
