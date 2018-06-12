import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { AccountShow } from './show';

const mockMuiTheme = {
  palette: {},
};

test('Shows HD path for hardware account', () => {
  const account = fromJS({
    id: '0x1234',
    hardware: true,
    hdpath: 'HD/PATH',
  });
  const wrapper = shallow(<AccountShow muiTheme={mockMuiTheme} account={ account }/>);
  expect(wrapper.containsAnyMatchingElements([<div key="1">HD/PATH</div>])).toBeTruthy();
});
