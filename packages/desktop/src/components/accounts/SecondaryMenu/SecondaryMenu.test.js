import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { SecondaryMenu } from './SecondaryMenu';

const mockMuiTheme = {
  palette: {},
};

const account = fromJS({});
describe('SecondaryMenu', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<SecondaryMenu
      muiTheme={mockMuiTheme}
      account={account}
      onExport={() => {}}
      onPrint={() => {}}
      onHide={() => {}}
    />);
    expect(wrapper).toBeDefined();
  });
});
