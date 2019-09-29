import { toBaseUnits } from '@emeraldplatform/core';
import { Units } from '@emeraldwallet/core';
import { shallow } from 'enzyme';
import * as React from 'react';
import AmountField from './AmountField';

describe('AmountField', () => {
  it('should renders without crash', () => {
    const amount = Units.ZERO;
    const wrapper = shallow(<AmountField tokenDecimals={8} amount={amount} />);
    expect(wrapper).toBeDefined();
  });

  it('should call onChangeAmount', () => {
    const onChangeAmount = jest.fn();
    const amount = Units.ZERO;
    const wrapper = shallow(<AmountField tokenDecimals={8} amount={amount} onChangeAmount={onChangeAmount}/>);
    wrapper.find('Input').simulate('change', { target: { value: '567' } });
    expect(onChangeAmount.mock.calls.length).toBe(1);
    expect(onChangeAmount.mock.calls[0][0].toString()).toBe('567');
    expect(typeof onChangeAmount.mock.calls[0][0]).toBe('object');
    expect(onChangeAmount.mock.calls[0][0]).toEqual(new Units(toBaseUnits('567', 8).toString(10), 8));
  });
});
