import { Wei } from '@emeraldplatform/eth';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { EthereumAccountItem } from '../../src/wallets/WalletDetails/EthereumAccountItem';

storiesOf('EthereumAccountItem', module)
  .add('default', () => (
    <EthereumAccountItem
      balance={Wei.ZERO}
      account={{ address: '0x12345678901234567890', id: '', blockchain: 100, key: undefined }}
      tokensBalances={[]}
    />
  ));
