import React from 'react';
import { shallow } from 'enzyme';
import GasLimitField from '.';


describe('GasLimitField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<GasLimitField />);
    expect(wrapper).toBeDefined();
  });
});
