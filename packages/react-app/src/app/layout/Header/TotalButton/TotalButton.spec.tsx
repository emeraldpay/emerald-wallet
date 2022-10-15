import { CurrencyAmount } from '@emeraldwallet/core';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import TotalButton from './TotalButton';

describe('Total', () => {
  it('should renders without crash', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <TotalButton fiatCurrencies={[]} totalBalance={new CurrencyAmount(0, 'USD')} />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
  });
});
