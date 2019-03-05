import * as React from 'react';
import { shallow } from 'enzyme';
import Logo from './Logo';

describe('Logo', () => {
  it('should be created without crash', () => {
    const component = shallow(<Logo/>);
    expect(component).toBeDefined();
  });
});


