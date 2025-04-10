import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import * as React from 'react';
import { EmeraldTheme } from '../../../index';
import Notification from './Notification';

describe('Notification', () => {
  it('should be created without crash', () => {
    const component = render(
      <ThemeProvider theme={EmeraldTheme}>
        <Notification notificationMessage="message55" onButtonClick={() => undefined} onClose={() => undefined} />,
      </ThemeProvider>,
    );

    expect(component).toBeDefined();
  });
});
