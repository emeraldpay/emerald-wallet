import React from 'react';
import { storiesOf } from '@storybook/react';
import theme from 'emerald-js-ui/src/theme.json';
import AboutContainer from '../../src/containers/About/About';

theme.button = {};
theme.flatButton = {};

storiesOf('AboutContainer', module)
  .add('default', () => (<AboutContainer onButtonClick={() => console.log('clicked')}/>));

