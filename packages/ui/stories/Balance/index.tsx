import { Wei } from '@emeraldpay/bigamount-crypto';
import { Satoshi } from '@emeraldpay/bigamount-crypto/lib/bitcoin';
import { BlockchainCode, TokenRegistry } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Balance from '../../src/components/accounts/Balance';

const tokenRegistry = new TokenRegistry([
  {
    name: 'Dai Stablecoin',
    blockchain: 100,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    decimals: 18,
    type: 'ERC20',
    stablecoin: true,
  },
]);

storiesOf('Balance', module)
  .add('ethereum 10.501', () => <Balance balance={new Wei('10501000000000000000')} />)
  .add('dai', () => {
    const balance = tokenRegistry
      .byAddress(BlockchainCode.ETH, '0x6B175474E89094C44Da98b954EedeAC495271d0F')
      .getAmount('10501000000000000000');

    return <Balance balance={balance} />;
  })
  .add('bitcoin 0.1', () => <Balance balance={new Satoshi('10000000')} />);
