import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { TxView, styles2 } from './TxView';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

const mockMuiTheme = {
  palette: {},
};

const tx = fromJS({
  blockNumber: 1,
});
const from = fromJS({});
const to = fromJS({});

describe('TxView', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<TxView classes={classes} tx={tx} muiTheme={mockMuiTheme} fromAccount={from} toAccount={to} />);
    expect(wrapper).toBeDefined();
  });
});
