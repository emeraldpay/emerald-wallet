import { Wei } from '@emeraldpay/bigamount-crypto';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, TokenRegistry } from '@emeraldwallet/core';
import {Meta} from '@storybook/react';
import * as React from 'react';
import { WalletReference } from '../../src';

const contractAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const tokenRegistry = new TokenRegistry([
  {
    name: 'Dai Stablecoin',
    blockchain: 100,
    address: contractAddress,
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

const balance1 = Wei.ZERO;
const balance2 = new Wei(10.25);
const balance3 = tokenRegistry.byAddress(BlockchainCode.ETH, contractAddress).getAmount(1045);


export default {
  title: 'Wallet',
  component: WalletReference,
} as Meta

export const EmptyWallet = {
  args: {
    wallet: wallet1,
    balances: [balance1],
  }
};

export const WalletWithOneCurrency = {
  args: {
    wallet: wallet1,
    balances: [balance2],
  }
};

export const WalletWithTwoCurrencies = {
  args: {
    wallet: wallet1,
    balances: [balance2, balance3],
  }
};

export const UnnamedWallet = {
  args: {
    wallet: wallet2,
    balances: [balance1, balance3],
  }
};
