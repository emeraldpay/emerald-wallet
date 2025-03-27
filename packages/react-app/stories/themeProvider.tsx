import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material/styles';
import {Addon_DecoratorFunction} from "@storybook/types";
import * as React from 'react';
import {ReactElement} from "react";

const withTheme: Addon_DecoratorFunction<ReactElement> = (story) => (
  <ThemeProvider theme={Theme}>{story()}</ThemeProvider>
);

export default withTheme;
