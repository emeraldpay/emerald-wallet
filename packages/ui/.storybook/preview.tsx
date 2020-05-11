import { ThemeProvider } from '@material-ui/core/styles';
import { addDecorator, configure } from '@storybook/react';
import * as React from 'react';
import theme from '../src/theme';

const req = require.context('../stories/', true, /\.tsx$/);

function loadStories () {
  addDecorator((story) => (<ThemeProvider theme={theme}>{story()}</ThemeProvider>));
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
