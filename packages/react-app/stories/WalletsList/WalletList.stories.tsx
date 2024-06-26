import { BlockchainCode } from '@emeraldwallet/core';
import { accounts, tokens } from '@emeraldwallet/store';
import { Meta } from '@storybook/react';
import * as React from 'react';
import WalletList from '../../src/wallets/WalletList';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import { createWallets, setRates } from '../wallets';

const api = new MemoryApiMock();
const backend = new BackendMock();

const setBalances = [
  accounts.actions.setBalanceAction({
    address: '0x9d8e3fed246384e726b5962577503b916fb246d7',
    balance: '918522410000000000000/WEI',
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-1',
  }),
  accounts.actions.setBalanceAction({
    address: '0x577503b916fb246d79d8e3fed246384e726b5962',
    balance: '722410056000000000000/WEI',
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-2',
  }),
  accounts.actions.setBalanceAction({
    address: '0x577503b916fb246d79d8e3fed246384e726b5962',
    balance: '4981234000000000000000/WEI',
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-2',
  }),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
    {
      decimals: 18,
      symbol: 'DAI',
      unitsValue: '500000000000000000000',
    },
  ),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    '0x577503b916fb246d79d8e3fed246384e726b5962',
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
    {
      decimals: 18,
      symbol: 'DAI',
      unitsValue: '450000000000000000000',
    },
  ),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
    {
      decimals: 6,
      symbol: 'USDT',
      unitsValue: '500000000000',
    },
  ),
];

export default {
  title: 'Wallets List',
  decorators: [providerForStore(api, backend, [...setRates, ...createWallets])],
} as Meta;

export const TwoWalletEmpty = () => <WalletList />;

export const TwoWalletWithBalance = {
  decorators: [providerForStore(api, backend, [...setRates, ...createWallets, ...setBalances])],
  render: () => <WalletList />
};
