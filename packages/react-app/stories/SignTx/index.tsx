import { Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, EthereumTransactionType, workflow } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import SignTx from '../../src/transaction/SignTx';
import { BackendMock } from '../backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';

const ethereumTx = new workflow.CreateEthereumTx({
  amount: new Wei('10000'),
  blockchain: BlockchainCode.Goerli,
  from: '0x123',
  gas: 100,
  gasPrice: new Wei('100'),
  target: workflow.TxTarget.MANUAL,
  to: '0x456',
  type: EthereumTransactionType.EIP1559,
});

const backend = new BackendMock();

storiesOf('SignTx', module)
  .addDecorator(providerForStore(backend))
  .addDecorator(withTheme)
  .add('default', () => <SignTx tx={ethereumTx} />);
