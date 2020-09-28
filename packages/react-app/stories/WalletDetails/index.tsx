import {BlockchainCode} from '@emeraldwallet/core';
import {storiesOf} from '@storybook/react';
import * as React from 'react';
import withTheme from "../themeProvider";
import WalletDetails from "../../src/wallets/WalletDetails/WalletDetails";
import {BackendMock} from "../backendMock";
import {accounts, settings, tokens} from "@emeraldwallet/store";
import {providerForStore} from "../storeProvider";
import Addresses from "../../src/wallets/WalletDetails/Addresses";
import DetailsPage from "../../src/wallets/WalletDetails";
import {createWallets, setup} from '../wallets';

const backend = new BackendMock();

const setBalances = [
  accounts.actions.setBalanceAction({
    entryId: "1022fd13-3431-4f3b-bce8-109fdab15873-1",
    value: "918522410056000000000000/WEI"
  }),
  accounts.actions.setBalanceAction({
    entryId: "1022fd13-3431-4f3b-bce8-109fdab15873-2",
    value: "498123400000000000000000/WEI"
  }),
  tokens.actions.setTokenBalance(BlockchainCode.ETH, {
    decimals: 18,
    symbol: 'DAI',
    tokenId: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    unitsValue: '450000000000000000000'
  }, "0x9d8e3fed246384e726b5962577503b916fb246d7"),
  tokens.actions.setTokenBalance(BlockchainCode.ETH, {
    decimals: 6,
    symbol: 'USDT',
    tokenId: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    unitsValue: '500000000000'
  }, "0x9d8e3fed246384e726b5962577503b916fb246d7"),
];


storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets]))
  .addDecorator(withTheme)
  .add('single wallet', () => (
    <WalletDetails walletId={'8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef'}/>
  ));

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('with few balances', () => (
    <WalletDetails walletId={'1022fd13-3431-4f3b-bce8-109fdab15873'}/>
  ));

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('with bitcoin', () => (
    <WalletDetails walletId={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4'}/>
  ));

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('addresses list', () => (
    <Addresses walletId={'1022fd13-3431-4f3b-bce8-109fdab15873'}/>
  ));

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('addresses list with btc', () => (
    <Addresses walletId={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4'}/>
  ));

storiesOf('WalletDetails', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('whole page', () => (
    <DetailsPage walletId={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4'}/>
  ));