import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import ConfirmMnemonic from './ConfirmMnemonic';
import Theme from '../../../theme';

describe('ConfirmMnemonic', () => {
  it('renders without crash', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <ConfirmMnemonic mnemonic="mnemonic phrase" dpath={"m/44'/60'"} />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
  });
});
