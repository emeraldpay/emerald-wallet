import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import ShowPrivateKey from './ShowPrivateKey';

describe('ShowPrivateDialog', () => {
  it('renders without crash', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <ShowPrivateKey privateKey={'PK1'} t={() => ''} />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
    expect(component.findByText('PK1')).toBeDefined();
  });
});
