import { BlockchainCode } from '@emeraldwallet/core';
import { addressBook } from '@emeraldwallet/store';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../testStore';
import ToField from './ToField';

describe('ToField', () => {
  it('it renders without crash', () => {
    const store = createTestStore({ [addressBook.moduleName]: { contacts: {} } });

    const component = shallow(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <ToField blockchain={BlockchainCode.ETH} onChange={jest.fn()} />
        </ThemeProvider>
      </Provider>,
    );

    expect(component).toBeDefined();
  });

  it('handle input change', () => {
    const store = createTestStore({ [addressBook.moduleName]: { contacts: {} } });

    const onChange = jest.fn();

    const component = mount(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <ToField blockchain={BlockchainCode.ETH} onChange={onChange} />
        </ThemeProvider>
      </Provider>,
    );

    component.find('input').simulate('change', { target: { value: '0x5671' } });

    expect(onChange.mock.calls.length).toBe(1);
    expect(onChange.mock.calls[0][0]).toBe('0x5671');
  });
});
