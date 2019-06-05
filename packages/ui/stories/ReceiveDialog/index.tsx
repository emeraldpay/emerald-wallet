import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ReceiveDialog from '../../src/components/accounts/ReceiveDialog';

storiesOf('ReceiveDialog', module)
  .add('default', () => (<ReceiveDialog address={{value: "0x123", coinTicker: "ETH"}}/>));
