import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import { ContactForm, styles } from './ContactForm';

const reduceClasses = <T,>(prev: T, curr: any): T => ({ ...prev, [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ContactForm', () => {
  it('renders without crash', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <ContactForm
          blockchains={[]}
          classes={classes}
          title="Test Form"
          onCancel={() => undefined}
          onSubmit={() => undefined}
        />
      </ThemeProvider>,
    );
    expect(component).toBeDefined();
  });
});
