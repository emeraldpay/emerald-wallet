import { shallow } from 'enzyme';
import React from 'react';
import { TopBar, styles } from './TopBar';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

const mockMuiTheme = {
  palette: {},
};

describe('TopBar', () => {
  it('creates without crash', () => {
    const wrapper = shallow(<TopBar classes={classes} muiTheme={mockMuiTheme}/>);
  });
});
