import { Wei } from '@emeraldplatform/eth';
import { Units, workflow } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import CreateTx from '../../src/transaction/CreateTx';
import AmountField from '../../src/transaction/CreateTx/AmountField';
import FromField from '../../src/transaction/CreateTx/FromField';
import ToField from '../../src/transaction/CreateTx/ToField';

const txDetails = {
  token: 'ETC',
  gasLimit: '200',
  amount: new Wei('10000000'),
  gas: new BigNumber('100'),
  gasPrice: new Wei('10000'),
  target: workflow.TxTarget.MANUAL
};

storiesOf('CreateTx', module)
  .add('default', () => (
    <CreateTx
      tokenSymbols={['ETC']}
      token={'ETC'}
      tx={new workflow.CreateEthereumTx(txDetails)}
      txFeeToken='ETH'
    />
    ))
  .add('AmountField', () => (<AmountField amount={new Units('10000000', 18)} tokenDecimals={18}/>))
  .add('FromField', () => (<FromField accounts={['0x1', '02']}/>))
  .add('ToField', () => (<ToField />));
