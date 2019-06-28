import React from 'react';
import {Provider} from 'react-redux';
import {fromJS} from 'immutable';
import {mount, shallow} from 'enzyme';
import PasswordDialog from './passwordDialog';

function createStore() {
  return {
    dispatch() {},
    subscribe() {},
    getState() {
      return {
        wallet: {
          settings: fromJS({mode: {chains: ['ETH']}}),
        },
      };
    },
  };
}

describe('PasswordDialog', () => {
  xit('renders without crash', () => {
    // TODO TypeError: theme.spacing is not a function
    const component = mount(<Provider store={createStore()}><PasswordDialog t={jest.fn()} onGenerate={jest.fn()}/></Provider>);
    expect(component.children().first().props().chains.size).toBe(1);
  });
});
