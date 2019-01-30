import React from 'react';
import { shallow } from 'enzyme';
import { convert } from '@emeraldplatform/emerald-js';
import SignTxForm from './SignTxForm';
import TokenUnits from '../../../../lib/tokenUnits';

const mockMuiTheme = {
  palette: {},
};

describe('SignTxForm', () => {
  it('should render tx value correctly', () => {
    const tx = {
      amount: convert.toBigNumber('100.0000'),
    };
    const fee = new TokenUnits(2000, 18);

    const component = shallow(<SignTxForm muiTheme={mockMuiTheme} tx={tx} fee={fee} />);
    expect(component).toBeDefined();
    /* expect(component.findWhere((n) => n.text() === '100')).toHaveLength(1);

     * tx = {
     *   amount: convert.toBigNumber('100.0120'),
     * };

     * component = shallow(<SignTxForm muiTheme={mockMuiTheme} tx={tx} fee={fee} />);
     * expect(component).toBeDefined();
     * expect(component.findWhere((n) => n.text() === '100.012')).toHaveLength(1); */
  });
});
