import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import About from './About';

const mockMuiTheme = {
  palette: {},
};

describe('About page', () => {
  it('renders about page without crash', () => {
    const component = shallow(<About muiTheme={mockMuiTheme}/>);
  });
});

