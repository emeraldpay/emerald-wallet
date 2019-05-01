import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import Total from './Total';
import { Wei } from '@emeraldplatform/eth';

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
<<<<<<< HEAD
    const component = mount(<Provider store={createStore()}><Total /></Provider>);
    expect(component.find(Total).children().first().props().total).toEqual('0.00300');
=======
    const component = shallow(<Total />, {context: {store: createStore()}});
    expect(component.props().total).toEqual('0.003');
>>>>>>> master
  });
});
