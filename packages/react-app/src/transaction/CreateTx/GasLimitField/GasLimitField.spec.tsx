import { shallow } from 'enzyme';
import * as React from 'react';
import {GasLimitField} from './GasLimitField';
import {Wei} from '@emeraldpay/bigamount-crypto';

const reduceClasses = (prev: any, curr: any) => ({ ...prev,  [curr]: curr });
const classes = Object.keys({ container: {} }).reduce(reduceClasses, {});

describe('GasLimitField', () => {
  it('it renders without crash', () => {
    const fee = new Wei(0.002, "ETHER");
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
