import { shallow } from 'enzyme';
import React from 'react';
import { fromJS } from 'immutable';
import TokensList from './';

function createStore() {
  return {
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
    const component = shallow(<TokensList />, {context: {store}});
    expect(component.props().tokens.size).toEqual(store.getState().tokens.get('tokens').size);
  });
});
