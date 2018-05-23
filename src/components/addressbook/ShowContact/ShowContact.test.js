import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { ShowContact } from './ShowContact';

const mockMuiTheme = {
  palette: {},
};

const account = fromJS({});
describe('ShowContact', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<ShowContact address={account} muiTheme={mockMuiTheme} />);
    expect(wrapper).toBeDefined();
  });
});
