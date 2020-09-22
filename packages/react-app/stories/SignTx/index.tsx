import { workflow } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import SignTx from '../../src/transaction/SignTx';
import {Wei} from '@emeraldpay/bigamount-crypto';

const tx = {
  from: '0x123',
  to: '0x456,',
  token: 'ETH',
  amount: new Wei('10000'),
  gasLimit: '2100',
  gasPrice: new Wei('100'),
  target: workflow.TxTarget.MANUAL,
  gas: new BigNumber(100)
};

storiesOf('SignTx', module)
  .add('default', () => (
    <SignTx
      tx={new workflow.CreateEthereumTx(tx)}
    />
    ));
