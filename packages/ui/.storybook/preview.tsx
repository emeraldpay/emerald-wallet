import {Theme} from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import { Preview } from '@storybook/react';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={Theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
