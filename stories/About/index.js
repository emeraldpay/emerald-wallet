import React from 'react';
import { storiesOf } from '@storybook/react';
import {Button} from 'emerald-js-ui';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import muiThemeable from 'material-ui/styles/muiThemeable';
import theme from 'emerald-js-ui/src/theme.json';
import { Logo as EtcLogo } from 'emerald-js-ui/lib/icons';
import About from '../../src/containers/About/About';

theme.button = {};
theme.flatButton = {};

storiesOf('About', module)
  .add('default', () => (<About onButtonClick={() => console.log('clicked')}/>));

