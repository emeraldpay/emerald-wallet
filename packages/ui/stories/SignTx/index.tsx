import * as React from 'react';
import {storiesOf} from '@storybook/react';
import SignTx from '../../src/components/tx/send/SignTx';

const tx = {
  from: '0x123',
  to: '0x456,',
  token: 'ETH',
  amount: '100',
  gasLimit: '2100'
};

storiesOf('SignTx', module)
  .add('default', () => (
    <SignTx
      tx={tx}

    />));

