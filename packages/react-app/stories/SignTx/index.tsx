import { Wei } from '@emeraldpay/bigamount-crypto';
import { workflow } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import SignTx from '../../src/transaction/SignTx';

const ethereumTx = new workflow.CreateEthereumTx({
  amount: new Wei('10000'),
  from: '0x123',
  gas: new BigNumber(100),
  gasPrice: new Wei('100'),
  target: workflow.TxTarget.MANUAL,
  to: '0x456',
});

storiesOf('SignTx', module).add('default', () => <SignTx tx={ethereumTx} />);
