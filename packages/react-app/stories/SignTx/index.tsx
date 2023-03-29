import { Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, EthereumTransactionType, workflow } from '@emeraldwallet/core';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import SignTransaction from '../../src/transaction/SignTransaction';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';

const api = new MemoryApiMock();
const backend = new BackendMock();

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

storiesOf('SignTx', module)
  .addDecorator(providerForStore(api, backend))
  .addDecorator(withTheme)
  .add('default', () => (
    <SignTransaction
      transaction={ethereumTx}
      onCancel={action('onCancel')}
      onChangePassword={action('onChangePassword')}
      onSubmit={action('onSubmit')}
    />
  ));
