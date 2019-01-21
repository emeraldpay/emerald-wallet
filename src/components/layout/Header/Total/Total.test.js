import { shallow } from 'enzyme';
import React from 'react';
import { fromJS } from 'immutable';
import { Wei } from '@emeraldplatform/emerald-js';
import Total from './';

function createStore() {
  return {
    subscribe() {},
    getState() {
      return {
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
    const component = shallow(<Total />, {context: {store: createStore()}});
    expect(component.props().total).toEqual('0.00300');
  });
});
