import { shallow } from 'enzyme';
import * as React from 'react';
import Logo from './Logo';

describe('Logo', () => {
  it('should be created without crash', () => {
    const component = shallow(<Logo/>);
    expect(component).toBeDefined();
  });
});
