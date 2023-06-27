import { BlockchainCode } from '@emeraldwallet/core';
import { accounts, tokens } from '@emeraldwallet/store';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import DetailsPage from '../../src/wallets/WalletDetails';
import Addresses from '../../src/wallets/WalletDetails/Addresses';
import WalletDetails from '../../src/wallets/WalletDetails/WalletDetails';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, initLauncher, setRates } from '../wallets';

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
    balance: '498123400000000000000000/WEI',
    entryId: '1022fd13-3431-4f3b-bce8-109fdab15873-2',
  }),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
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

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(api, backend, [...initLauncher, ...setRates, ...createWallets]))
  .addDecorator(withTheme)
  .add('single wallet', () => <WalletDetails walletId="8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef" />);

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(api, backend, [...initLauncher, ...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('with few balances', () => <WalletDetails walletId="1022fd13-3431-4f3b-bce8-109fdab15873" />);

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(api, backend, [...initLauncher, ...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('with bitcoin', () => <WalletDetails walletId="f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4" />);

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(api, backend, [...initLauncher, ...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('addresses list', () => <Addresses walletId="1022fd13-3431-4f3b-bce8-109fdab15873" />);

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(api, backend, [...initLauncher, ...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('addresses list with btc', () => <Addresses walletId="f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4" />);

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(api, backend, [...initLauncher, ...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('whole page', () => <DetailsPage walletId="f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4" />);
