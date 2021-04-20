import {shallow, mount} from 'enzyme';
import * as React from 'react';
import AmountField from './AmountField';
import {Wei, WEIS} from "@emeraldpay/bigamount-crypto";
import {Provider} from "react-redux";
import {createTestStore} from "../../../_tests";

describe('AmountField', () => {
  it('should renders without crash', () => {
    const onChangeAmount = jest.fn();
    const amount = Wei.ZERO;
    const wrapper = shallow(
      <Provider store={createTestStore()}>
        <AmountField initialAmount={amount} units={WEIS} onChangeAmount={onChangeAmount}/>
      </Provider>
    );
    expect(wrapper).toBeDefined();
  });

  it('should call onChangeAmount', () => {
    const onChangeAmount = jest.fn();
    const amount = Wei.ZERO;
    const wrapper = mount(
      <Provider store={createTestStore()}>
        <AmountField initialAmount={amount} units={WEIS} onChangeAmount={onChangeAmount}/>
      </Provider>
    );
    wrapper.find('input').simulate('change', {target: {value: '567'}});
    expect(onChangeAmount.mock.calls.length).toBe(1);
    expect(onChangeAmount.mock.calls[0][0].toString()).toBe('567 ETH');
    expect(typeof onChangeAmount.mock.calls[0][0]).toBe('object');
    expect(onChangeAmount.mock.calls[0][0]).toEqual(new Wei('567', "ETHER"));
  });
});
