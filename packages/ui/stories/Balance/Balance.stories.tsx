import { Wei } from '@emeraldpay/bigamount-crypto';
import { Satoshi } from '@emeraldpay/bigamount-crypto/lib/bitcoin';
import { BlockchainCode, TokenRegistry } from '@emeraldwallet/core';
import { Meta } from '@storybook/react';
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
const balance = tokenRegistry
  .byAddress(BlockchainCode.ETH, '0x6B175474E89094C44Da98b954EedeAC495271d0F')
  .getAmount('10501000000000000000');

export default {
  title: 'Balance',
  component: Balance,
} as Meta;

export const Ethereum = {
  args: {
    balance: new Wei('10501000000000000000')
  }
};

export const Dai = {
  args: {
    balance: balance
  }
};

export const Bitcoin = {
  args: {
    balance: new Satoshi('10000000')
  }
};
