import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { TxView } from './TxView';

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
    const wrapper = shallow(<TxView tx={tx} muiTheme={mockMuiTheme} fromAccount={from} toAccount={to} />);
    expect(wrapper).toBeDefined();
  });
});
