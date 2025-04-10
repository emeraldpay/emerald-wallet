import { CurrencyAmount } from '@emeraldwallet/core';
import { EmeraldTheme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import * as React from 'react';
import TotalButton from './TotalButton';

describe('Total', () => {
  it('should renders without crash', () => {
    const component = render(
      <ThemeProvider theme={EmeraldTheme}>
        <TotalButton balances={[]} loading={false} totalBalance={new CurrencyAmount(0, 'USD')} />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
  });
});
