import React from 'react';
import { storiesOf } from '@storybook/react';
import Landing from '../../src/components/landing/landing';

storiesOf('Landing', module)
  .add('default', () => (<Landing />));
