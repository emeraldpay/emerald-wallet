import * as React from 'react';
import {configure, addDecorator} from '@storybook/react';
import {ThemeProvider} from '@material-ui/styles';
import theme from '@emeraldplatform/ui/lib/theme';

const req = require.context('../stories/', true, /\.tsx$/);

function loadStories() {
  addDecorator((story) => (<ThemeProvider theme={theme}>{story()}</ThemeProvider>));
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);
