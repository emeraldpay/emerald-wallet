import * as React from 'react';
import { shallow } from 'enzyme';
import { GasLimitField } from './GasLimitField';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys({container:{}}).reduce(reduceClasses, {});

describe('GasLimitField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(
      <GasLimitField
        gasLimit="2100"
        txFeeFiat=""
        txFee="2"
        txFeeToken="ETC"
        fiatCurrency="USD"
        classes={classes}
      />);
    expect(wrapper).toBeDefined();
  });
});
