import React from 'react';
import { shallow } from 'enzyme';
import { AddToken } from './add';
import ConnectedAddToken from './';

describe('tokens/AddToken', () => {
  it('renders without crash', () => {
    const component = shallow(<AddToken/>);
  });

  it('onSubmit dispatch valid actions to store', () => {
    const store = {
      subscribe() {},
      getState() {},
      dispatch() { return Promise.resolve(); },
    };
    const component = shallow(<ConnectedAddToken />, {context: { store}});
    expect(component.props().onSubmit({token: {}})).toBeDefined();
  });
});

