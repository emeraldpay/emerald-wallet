import { EmeraldTheme} from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import { Preview } from '@storybook/react';

const preview: Preview = {
  decorators: [
    (Story) => (
        <ThemeProvider theme={EmeraldTheme}>
          <Story />
        </ThemeProvider>
    ),
  ],
};

export default preview;
