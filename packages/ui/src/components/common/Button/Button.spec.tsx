import { shallow } from 'enzyme';
import * as React from 'react';
import Button from './Button';

describe('Button', () => {
  it('should be created without crash', () => {
    const component = shallow(<Button/>);
    expect(component).toBeDefined();
  });
});
