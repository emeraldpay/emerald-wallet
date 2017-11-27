import React from 'react';
import { shallow } from 'enzyme';
import Button from 'elements/Button';
import { ButtonGroup } from './buttonGroup';

test('Empty children list', () => {
  const component = shallow(<ButtonGroup />);
});

test('Renders children list', () => {
  const wrapper = shallow(<ButtonGroup>
    <Button />
    <Button />
  </ButtonGroup>);
  expect(wrapper.children()).toHaveLength(2);
});
