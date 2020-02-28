import { Theme } from '@emeraldplatform/ui';
import { ThemeProvider } from '@material-ui/core/styles';
import { addDecorator, configure } from '@storybook/react';
import * as React from 'react';

const req = require.context('../stories/', true, /\.tsx$/);

function loadStories () {
  addDecorator((story) => (<ThemeProvider theme={Theme}>{story()}</ThemeProvider>));
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
