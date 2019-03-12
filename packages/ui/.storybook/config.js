import React from 'react';
import {configure, addDecorator} from '@storybook/react';
import {MuiThemeProvider} from '@material-ui/core/styles';
import theme from '@emeraldplatform/ui/lib/theme';

const req = require.context('../stories/', true, /\.tsx$/);

function loadStories() {
  addDecorator((story) => (<MuiThemeProvider theme={theme}>{story()}</MuiThemeProvider>))
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);
