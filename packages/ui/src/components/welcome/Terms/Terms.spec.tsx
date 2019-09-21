import { shallow } from 'enzyme';
import * as React from 'react';
import Terms from './Terms';

describe('Terms', () => {
  it('renders without crashing', () => {
    const component = shallow(<Terms />);
    expect(component).toBeDefined();
  });
});
