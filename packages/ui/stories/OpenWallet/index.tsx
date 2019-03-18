import * as React from 'react';
import { storiesOf } from '@storybook/react';
import OpenWallet from '../../src/components/welcome/OpenWallet';

storiesOf('OpenWallet', module)
  .add('default', () => (<OpenWallet />));