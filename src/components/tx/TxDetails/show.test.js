import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { TransactionShow } from './show';

const mockMuiTheme = {
  palette: {},
};

test('Shows Tx.data', () => {
  const tx = fromJS({
    hash: '0x01',
    data: '0xDADA',
  });
  const component = shallow(<TransactionShow transaction={tx} muiTheme={mockMuiTheme}/>);
  expect(component.findWhere((n) => n.text() === '0xDADA')).toHaveLength(3);
});
