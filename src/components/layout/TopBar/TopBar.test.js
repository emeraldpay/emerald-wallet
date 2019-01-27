import { shallow } from 'enzyme';
import React from 'react';
import { TopBar, styles2 } from './TopBar';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

const mockMuiTheme = {
  palette: {},
};

describe('TopBar', () => {
  it('creates without crash', () => {
    const wrapper = shallow(<TopBar classes={classes} muiTheme={mockMuiTheme}/>);
  });
});
