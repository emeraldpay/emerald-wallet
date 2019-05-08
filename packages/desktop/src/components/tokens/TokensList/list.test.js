import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';
import TokensList from './list';

function createStore() {
  return {
    dispatch: jest.fn(),
    subscribe() {},
    getState() {
      return {
        tokens: fromJS({
          tokens: [{}, {}],
        }),
      };
    },
  };
}

describe('tokens/TokensList', () => {
  it('renders list of tokens from store', () => {
    const store = createStore();
    const component = mount(<TokensList store={store}/>);
    expect(component.children().first().props().tokens.size).toEqual(store.getState().tokens.get('tokens').size);
  });
});
