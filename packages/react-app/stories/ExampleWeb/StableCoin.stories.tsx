import {BlockchainCode} from '@emeraldwallet/core';
import type {Meta, StoryObj} from '@storybook/react';
import {createSeeds, initLauncher, setRates, xpubSeedId} from "../wallets";
import {providerForStore} from "../storeProvider";
import WalletBalance from "../../src/wallets/WalletDetails/WalletBalance";
import {BackendMock, MemoryApiMock} from "../__mocks__";
import {Wallet} from "@emeraldpay/emerald-vault-core";
import {accounts, application, tokens} from "@emeraldwallet/store";
import * as React from 'react';

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
  ],
  createdAt: new Date(),
};

const configure = [
  accounts.actions.setBalanceAction({
    address: '0x9d8e3fed246384e726b5962577503b916fb246d7',
    balance: '15224100000000000000/WEI',
    entryId: '60ed215e-e487-4245-8027-cd6efe3f9046-1',
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
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    {
      decimals: 6,
      symbol: 'USDT',
      unitsValue: '32001050000',
    },
  ),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    '0x9d8e3fed246384e726b5962577503b916fb246d7',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    {
      decimals: 6,
      symbol: 'USDC',
      unitsValue: '56011050000',
    },
  ),
  accounts.actions.setWalletsAction([wallet]),
];

export default {
  title: 'Example Web / Stable Coin Flexibility',
  decorators: [providerForStore(api, backend, [...initLauncher, ...setRates, ...configure])],
} as Meta;


export const Default = {
  name: 'Stable Coin Flexibility',
  render: () => <WalletBalance walletId={"60ed215e-e487-4245-8027-cd6efe3f9046"}/>
};
