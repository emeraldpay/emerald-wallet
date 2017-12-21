import React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import { Landing } from '../../src/components/landing/landing';

const muiTheme = getMuiTheme({
  fontFamily: 'Rubik',
});

storiesOf('Landing', module)
  .addDecorator((story) => (
    <MuiThemeProvider muiTheme={muiTheme}>
      {story()}
    </MuiThemeProvider>
  ))
  .add('default', () => (
    <Landing
    />));
