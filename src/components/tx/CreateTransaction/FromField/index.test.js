import React from 'react';
import { shallow } from 'enzyme';
import FromField from '.';


describe('FromField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<FromField />);
    expect(wrapper).toBeDefined();
  });
});
