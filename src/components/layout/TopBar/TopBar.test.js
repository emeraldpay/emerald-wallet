import React from 'react';
import {TopBar} from './TopBar';
import {shallow} from 'enzyme';

const mockMuiTheme = {
  palette: {},
};

describe('TopBar', () => {
  it('creates without crash', () => {
    const wrapper = shallow(<TopBar muiTheme={mockMuiTheme}/>);
  });
});
