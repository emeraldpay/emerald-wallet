import React from 'react';
import { shallow } from 'enzyme';
import Input from './input';

test('Renders', () => {
  const component = shallow(<Input />);
});

test('should wrap TextField', () => {
  const wrapper = shallow(<Input />);
  expect(wrapper.text()).toContain('TextField');
});
