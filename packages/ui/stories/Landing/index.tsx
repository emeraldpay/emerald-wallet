import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Landing from '../../src/components/Landing';

storiesOf('Landing', module)
  .add('default', () => (<Landing />));