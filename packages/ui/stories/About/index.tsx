import * as React from 'react';
import { storiesOf } from '@storybook/react';
import About from '../../src/components/About';

storiesOf('About', module)
  .add('default', () => (<About />));