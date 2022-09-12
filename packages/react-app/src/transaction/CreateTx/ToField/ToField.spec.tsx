import { BlockchainCode } from '@emeraldwallet/core';
import { shallow } from 'enzyme';
import * as React from 'react';
import ToField from '.';

describe('ToField', () => {
  it('it renders without crash', () => {
    const component = shallow(<ToField blockchain={BlockchainCode.ETH} onChange={jest.fn()} />);

    expect(component).toBeDefined();
  });

  it('on init calls onChangeTo function', () => {
    const onChange = jest.fn();

    shallow(<ToField blockchain={BlockchainCode.ETH} onChange={onChange} />);

    expect(onChange).toHaveBeenCalled();
  });

  it('handle input change', () => {
    const onChange = jest.fn();
    const component = shallow(<ToField blockchain={BlockchainCode.ETH} onChange={onChange} />);

    component.find('Input').simulate('change', { target: { value: '0x5671' } });

    expect(onChange.mock.calls.length).toBe(2);
    expect(onChange.mock.calls[1][0]).toBe('0x5671');
  });
});
