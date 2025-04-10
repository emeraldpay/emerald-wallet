import { EmeraldTheme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material';
import {Addon_DecoratorFunction} from "@storybook/types";
import * as React from 'react';
import {ReactElement} from "react";

const withTheme: Addon_DecoratorFunction<ReactElement> = (story) => (
  <ThemeProvider theme={EmeraldTheme}>{story()}</ThemeProvider>
);

export default withTheme;
