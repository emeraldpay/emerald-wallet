import { configure } from '@storybook/react';
import { muiTheme } from 'storybook-addon-material-ui';
import theme from 'emerald-js-ui/src/theme.json';
import { addDecorator } from '@storybook/react';

function loadStories() {
  addDecorator(muiTheme([theme, 'Light Theme', 'Dark Theme']))
  require('../stories/index.js');
  // You can require as many stories as you need.
}

configure(loadStories, module);
