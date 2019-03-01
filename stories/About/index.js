import React from 'react';
import { storiesOf } from '@storybook/react';
import theme from 'emerald-js-ui/src/theme.json';
import About from '../../src/containers/About/About';

theme.button = {};
theme.flatButton = {};

storiesOf('About', module)
  .add('default', () => (<About onButtonClick={() => console.log('clicked')}/>));

