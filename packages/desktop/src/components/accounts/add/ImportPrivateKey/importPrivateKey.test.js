import React from 'react';
import { shallow } from 'enzyme';
import { ImportPrivateKey, styles2 } from './importPrivateKey';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});
const mockMuiTheme = {
  palette: {},
};

describe('ImportPrivateKey', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportPrivateKey classes={classes} muiTheme={mockMuiTheme}/>);
  });
});
