import { BlockchainCode } from '@emeraldwallet/core';
import { accounts, tokens } from '@emeraldwallet/store';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import WalletList from '../../src/wallets/WalletList';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, setRates } from '../wallets';

const api = new MemoryApiMock();
const backend = new BackendMock();

const setBalances = [
  accounts.actions.setBalanceAction({
    address: '0x9d8e3fed246384e726b5962577503b916fb246d7',
    balance: '918522410056000000000000/WEI',
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-1',
  }),
  accounts.actions.setBalanceAction({
    address: '0x577503b916fb246d79d8e3fed246384e726b5962',
    balance: '722410056000000000000/WEI',
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-2',
  }),
  accounts.actions.setBalanceAction({
    address: '0x577503b916fb246d79d8e3fed246384e726b5962',
    balance: '498123400000000000000000/WEI',
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-2',
  }),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    {
      decimals: 18,
      symbol: 'DAI',
      tokenId: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      unitsValue: '500000000000000000000',
    },
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
  ),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    {
      decimals: 18,
      symbol: 'DAI',
      tokenId: '0x577503b916fb246d79d8e3fed246384e726b5962',
      unitsValue: '450000000000000000000',
    },
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
  ),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    {
      decimals: 6,
      symbol: 'USDT',
      tokenId: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      unitsValue: '500000000000',
    },
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
  ),
];

storiesOf('Wallets List', module)
  .addDecorator(providerForStore(api, backend, [...setRates, ...createWallets]))
  .addDecorator(withTheme)
  .add('two wallet - empty', () => <WalletList />);

storiesOf('Wallets List', module)
  .addDecorator(providerForStore(api, backend, [...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('two wallet - with balance', () => <WalletList />);
