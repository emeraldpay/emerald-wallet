import * as React from 'react';
import { shallow } from 'enzyme';
import Terms from './Terms';

describe('Terms', () => {
  it('renders without crashing', () => {
    const component = shallow(<Terms />);
    expect(component).toBeDefined();
  });
});
