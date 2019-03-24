import * as React from 'react';
import { shallow } from 'enzyme';
import AmountField from './AmountField';

describe('AmountField', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<AmountField amount="0" balance="1.0" />);
    expect(wrapper).toBeDefined();
  });

  it('should call onChangeAmount', () => {
    const onChangeAmount = jest.fn();
    const wrapper = shallow(<AmountField amount="0" balance="1.0" onChangeAmount={onChangeAmount}/>);
    wrapper.find('Input').simulate('change', {target: {value:'567'}});
    expect(onChangeAmount.mock.calls.length).toBe(1);
    expect(onChangeAmount.mock.calls[0][0]).toBe('567');
  })
});
