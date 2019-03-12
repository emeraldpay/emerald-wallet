import React from 'react';
import { shallow } from 'enzyme';
import CreateTransaction from './CreateTransaction';


describe('CreateTransaction', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<CreateTransaction />);
    expect(wrapper).toBeDefined();
  });
});
