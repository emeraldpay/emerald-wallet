import { shallow } from 'enzyme';
import * as React from 'react';
import InitialSetup from './InitialSetup';

describe('InitialSetup', () => {
  it('renders without crashing', () => {
    const component = shallow(<InitialSetup />);
    expect(component).toBeDefined();
  });
});
