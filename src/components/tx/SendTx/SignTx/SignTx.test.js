import React from 'react';
import { shallow } from 'enzyme';
import { convert } from 'emerald-js';
import { SignTx } from './SignTx';
import TokenUnits from '../../../../lib/tokenUnits';

const mockMuiTheme = {
  palette: {
    secondTextColor: 'red',
  },
};

describe('SignTx', () => {
  it('should render tx value correctly', () => {
    let tx = {
      value: convert.toBigNumber('100.0000'),
    };
    const fee = new TokenUnits(2000, 18);

    let component = shallow(<SignTx muiTheme={mockMuiTheme} tx={tx} fee={fee} />);
    expect(component).toBeDefined();
    expect(component.findWhere((n) => n.text() === '100')).toHaveLength(1);

    tx = {
      value: convert.toBigNumber('100.0120'),
    };

    component = shallow(<SignTx muiTheme={mockMuiTheme} tx={tx} fee={fee} />);
    expect(component).toBeDefined();
    expect(component.findWhere((n) => n.text() === '100.012')).toHaveLength(1);
  });
});
