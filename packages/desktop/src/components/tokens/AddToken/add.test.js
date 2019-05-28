import React from 'react';
import {Provider} from 'react-redux';
import { shallow, mount } from 'enzyme';
import { NewCustomToken } from './add';
import ConnectedAddToken from '.';

describe('tokens/AddToken', () => {
  it('renders without crash', () => {
    const component = shallow(<NewCustomToken />);
    expect(component).toBeDefined();
  });

  it('onSubmit dispatch valid actions to store', () => {
    const store = {
      subscribe() {},
      getState() {},
      dispatch() { return Promise.resolve(); },
    };
    const component = mount(<Provider store={store}><ConnectedAddToken /></Provider>);
    expect(component.children().first().children().first().props().onSubmit({token: {}})).toBeDefined();
  });
});
