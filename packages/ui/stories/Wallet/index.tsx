import { Wei } from '@emeraldpay/bigamount-crypto';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, TokenRegistry } from '@emeraldwallet/core';
import { BalanceValue } from '@emeraldwallet/store';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { WalletReference } from '../../src';

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

const wallet1: Wallet = {
  entries: [],
  id: 'a7ca68a2-74f9-4c5e-be75-92ce3b8ceb05',
  name: 'My Wallet',
  // Sun 5 January 2020 11:20:00 UTC
  createdAt: new Date(1578223200000),
};

const wallet2: Wallet = {
  entries: [],
  id: '3acca0fa-8581-43b5-9296-bd3a1be6b663',
  // Fri 7 February 2020 13:20:06 UTC
  createdAt: new Date(1581081606000),
};

const balance1: BalanceValue = {
  balance: Wei.ZERO,
  blockchain: BlockchainCode.ETH,
};

const balance2: BalanceValue = {
  balance: new Wei(10.25),
  blockchain: BlockchainCode.ETH,
};

const balance3: BalanceValue = {
  balance: tokenRegistry.byAddress(BlockchainCode.ETH, '0x6B175474E89094C44Da98b954EedeAC495271d0F').getAmount(1045),
  blockchain: BlockchainCode.ETH,
};

storiesOf('Wallet', module)
  .add('empty wallet', () => <WalletReference wallet={wallet1} assets={[balance1]} />)
  .add('wallet with one currency', () => <WalletReference wallet={wallet1} assets={[balance2]} />)
  .add('wallet with two currencies', () => <WalletReference wallet={wallet1} assets={[balance2, balance3]} />)
  .add('unnamed wallet', () => <WalletReference wallet={wallet2} assets={[balance1, balance3]} />);
