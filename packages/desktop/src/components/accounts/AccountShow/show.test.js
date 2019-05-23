import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { AccountShow, styles2 } from './show';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

const mockMuiTheme = {
  palette: {},
};

test('Shows HD path for hardware account', () => {
  const account = fromJS({
    id: '0x1234',
    hardware: true,
    hdpath: 'HD/PATH',
    blockchain: 'etc',
  });
  const wrapper = shallow(<AccountShow classes={classes} muiTheme={mockMuiTheme} account={ account }/>);
  expect(wrapper.containsAnyMatchingElements([<div key="1">HD/PATH</div>])).toBeTruthy();
});
