import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Landing from '../../src/onboarding/Landing/LandingView';

storiesOf('Landing', module)
  .add('default', () => (<Landing />));
