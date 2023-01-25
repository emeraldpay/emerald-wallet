import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
  it('renders without crash', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <ContactForm blockchains={[]} title="Test Form" onCancel={() => undefined} onSubmit={() => undefined} />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
  });
});
