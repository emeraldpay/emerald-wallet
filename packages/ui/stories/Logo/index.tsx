import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Logo from '../../src/components/common/Logo';

storiesOf('Logo', module)
  .add('default', () => (<Logo />));
