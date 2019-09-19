import { mount } from 'enzyme';
import * as React from 'react';
import Header from './Header';

describe('Header', () => {
  it('should renders', () => {
    const component = mount(<Header />);
    expect(component).toBeDefined();
  });
});
