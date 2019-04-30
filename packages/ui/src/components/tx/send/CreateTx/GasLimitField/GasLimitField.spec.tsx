import * as React from 'react';
import { shallow } from 'enzyme';
import { GasLimitField } from './GasLimitField';
import { Wei, Units } from '@emeraldplatform/eth';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys({container:{}}).reduce(reduceClasses, {});

describe('GasLimitField', () => {
  it('it renders without crash', () => {
    const fee = new Wei(0.002, Units.ETHER);
    const wrapper = shallow(
      <GasLimitField
        gasLimit="2100"
        txFeeFiat=""
        txFee={fee}
        txFeeToken="ETC"
        fiatCurrency="USD"
        classes={classes}
      />);
    expect(wrapper).toBeDefined();
  });
});
