import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { ShowContact, styles } from './ShowContact';

const mockMuiTheme = {
  palette: {},
};

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

const account = fromJS({});
describe('ShowContact', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<ShowContact classes={classes} address={account} muiTheme={mockMuiTheme} />);
    expect(wrapper).toBeDefined();
  });
});
