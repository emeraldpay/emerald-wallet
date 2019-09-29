import { Units, Wei } from '@emeraldplatform/eth';
import { shallow } from 'enzyme';
import * as React from 'react';
import { GasLimitField } from './GasLimitField';

const reduceClasses = (prev: any, curr: any) => ({ ...prev,  [curr]: curr });
const classes = Object.keys({ container: {} }).reduce(reduceClasses, {});

describe('GasLimitField', () => {
  it('it renders without crash', () => {
    const fee = new Wei(0.002, Units.ETHER);
    const wrapper = shallow(
      <GasLimitField
        gasLimit='2100'
        txFeeFiat=''
        txFee={fee}
        txFeeToken='ETC'
        fiatCurrency='USD'
        classes={classes}
      />);
    expect(wrapper).toBeDefined();
  });
});
