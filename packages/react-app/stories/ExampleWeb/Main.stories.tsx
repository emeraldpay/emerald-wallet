import { BlockchainCode } from '@emeraldwallet/core';
import { accounts, tokens, application } from '@emeraldwallet/store';
import * as React from 'react';
import DetailsPage from '../../src/wallets/WalletDetails';
import Addresses from '../../src/wallets/WalletDetails/addresses/Addresses';
import WalletDetails from '../../src/wallets/WalletDetails/WalletDetails';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import {initLauncher, setRates, xpubSeedId} from '../wallets';
import {Meta} from "@storybook/react";
import {Wallet} from "@emeraldpay/emerald-vault-core";
import Header from "../../lib/app/layout/Header/Header";

const api = new MemoryApiMock();
const backend = new BackendMock();

const wallet: Wallet = {
  id: '60ed215e-e487-4245-8027-cd6efe3f9046',
  name: 'My Savings',
  reserved: [
    { seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', accountId: 2 }
  ],
  entries: [
    {
      key: { type: 'hd-path', seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', hdPath: "m/44'" },
      address: { type: 'single', value: '0x9d8e3fed246384e726b5962577503b916fb246d7' },
      blockchain: 100,
      id: '60ed215e-e487-4245-8027-cd6efe3f9046-1',
      createdAt: new Date(),
    },
    {
      // seed: lake cupboard yellow project spoil era educate behind move slide fluid early purpose stone panel
      key: { type: 'hd-path', seedId: xpubSeedId, hdPath: "m/84'/0'/3'/0/0" },
      address: {
        type: 'xpub',
        value:
          'zpub6trp3XEQXBogyby8NUy5xg5qykZAMnC7e4apsn1kNXhtGs3TKVpKS8P4DXMKuy56yKkLwgAYnWsMd9PzGnTdWAHoiwvRLwfAZ58ajkbVudW',
      },
      addresses: [],
      blockchain: 1,
      id: '60ed215e-e487-4245-8027-cd6efe3f9046-2',
      createdAt: new Date(),
      xpub: [],
    },
  ],
  createdAt: new Date(),
};

const configure = [
  accounts.actions.setBalanceAction({
    address: '0x9d8e3fed246384e726b5962577503b916fb246d7',
    balance: '15224100000000000000/WEI',
    entryId: '60ed215e-e487-4245-8027-cd6efe3f9046-1',
  }),
  accounts.actions.setBalanceAction({
    address: 'bc1qqvc28z0kgc7fmdfu440sd7knpgzytgnurszh6t',
    balance: '196120051/SAT',
    entryId: '60ed215e-e487-4245-8027-cd6efe3f9046-2',
  }),
  application.actions.setTokens([
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      blockchain: 100,
      decimals: 18,
      name: 'DAI',
      stablecoin: true,
      symbol: 'DAI',
      type: 'ERC20',
    },
    {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      blockchain: 100,
      decimals: 6,
      name: 'USDT',
      stablecoin: true,
      symbol: 'USDT',
      type: 'ERC20',
    }
  ], false),
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
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    {
      decimals: 6,
      symbol: 'USDT',
      unitsValue: '32001050000',
    },
  ),
  accounts.actions.setWalletsAction([wallet]),
];


export default {
  title: 'Example Web / Wallet',
  decorators: [providerForStore(api, backend, [...initLauncher, ...setRates, ...configure])],
  component: WalletDetails,
} as Meta;

export const Default = {
  name: 'Wallet',
  render: () => <div>
    <Header/>
    <div style={{paddingTop: 20,}}>
    <WalletDetails walletId={wallet.id} />
    </div>
  </div>,
}
