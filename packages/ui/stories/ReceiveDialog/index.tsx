import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ReceiveDialog from '../../src/components/accounts/ReceiveDialog';

storiesOf('ReceiveDialog', module)
  .add('default', () => (<ReceiveDialog address="0x123"/>));