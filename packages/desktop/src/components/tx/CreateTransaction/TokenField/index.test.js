import React from 'react';
import { shallow } from 'enzyme';
import TokenField from '.';

describe('TokenField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<TokenField />);
    expect(wrapper).toBeDefined();
  });
});
