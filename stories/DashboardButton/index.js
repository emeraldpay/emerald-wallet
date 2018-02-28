import React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import DashboardButton from '../../src/components/common/DashboardButton';

storiesOf('DashboardButton', module)
  .add('default', () => <DashboardButton />)
  .add('with label', () => <DashboardButton label='Go'/>);
