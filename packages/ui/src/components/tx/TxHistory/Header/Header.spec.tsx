import * as React from 'react';
import {mount} from 'enzyme';
import Header from './Header';

describe('Header', () => {
  it('should renders', () => {
    const component = mount(<Header />);
    expect(component).toBeDefined();
  })
});
