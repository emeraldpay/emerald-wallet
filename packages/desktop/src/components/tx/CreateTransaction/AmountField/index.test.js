import React from 'react';
import { shallow } from 'enzyme';
import AmountField from '.';

describe('AmountField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<AmountField />);
    expect(wrapper).toBeDefined();
  });
});
