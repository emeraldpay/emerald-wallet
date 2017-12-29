import React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import DashboardButton from '../../src/components/common/DashboardButton';

const muiTheme = getMuiTheme({
  fontFamily: 'Rubik',
});

storiesOf('DashboardButton', module)
  .addDecorator((story) => (
    <MuiThemeProvider muiTheme={muiTheme}>
      {story()}
    </MuiThemeProvider>
  ))
  .add('default', () => (
    <DashboardButton
    />));
