import { WEIS, Wei } from '@emeraldpay/bigamount-crypto';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../testStore';
import AmountField from './AmountField';

describe('AmountField', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(
      <Provider store={createTestStore()}>
        <ThemeProvider theme={Theme}>
          <AmountField amount={Wei.ZERO} units={WEIS} onChangeAmount={jest.fn()} onMaxClick={jest.fn()} />
        </ThemeProvider>
      </Provider>,
    );

    expect(wrapper).toBeDefined();
  });

  it('should call onChangeAmount', () => {
    const onChangeAmount = jest.fn();

    const wrapper = mount(
      <Provider store={createTestStore()}>
        <ThemeProvider theme={Theme}>
          <AmountField amount={Wei.ZERO} units={WEIS} onChangeAmount={onChangeAmount} onMaxClick={jest.fn()} />
        </ThemeProvider>
      </Provider>,
    );

    wrapper.find('input').simulate('change', { target: { value: '567' } });

    expect(onChangeAmount.mock.calls.length).toBe(1);
    expect(typeof onChangeAmount.mock.calls[0][0]).toBe('object');
    expect(onChangeAmount.mock.calls[0][0].toString()).toBe('567 ETH');
    expect(onChangeAmount.mock.calls[0][0]).toEqual(new Wei('567', 'ETHER'));
  });
});
