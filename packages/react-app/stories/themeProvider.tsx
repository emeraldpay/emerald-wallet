import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core/styles';
import { DecoratorFunction } from '@storybook/addons';
import * as React from 'react';

const withTheme: DecoratorFunction<React.ReactElement> = (story) => (
  <ThemeProvider theme={Theme}>{story()}</ThemeProvider>
);

export default withTheme;
