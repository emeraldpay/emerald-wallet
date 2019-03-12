import React from 'react';
import { shallow } from 'enzyme';
import { Settings } from './Settings';

describe('Settings', () => {
  it('should render without crash', () => {
    const component = shallow(<Settings t={() => {}} />);
  });
});
