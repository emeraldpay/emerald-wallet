import * as React from 'react';
import {storiesOf} from '@storybook/react';
import SignTx from '../../src/components/tx/send/SignTx';
import { Wei } from '@emeraldplatform/eth';

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
      amount={new Wei("10000")}
      tx={tx}
    />));

