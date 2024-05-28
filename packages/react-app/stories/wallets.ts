import { Wallet } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { accounts, settings, tokens } from '@emeraldwallet/store';

export const ledgerSeedId = '7befa8b6-670d-467a-8ddd-a9615087ba14';
export const xpubSeedId = 'b00e3378-40e7-4eca-b287-a5ead2f747d4';

const wallet1: Wallet = {
  id: '8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef',
  name: 'Current Spending (create from 0x9d8e3fed246384e726b5962577503b916fb246d7)',
  reserved: [{ seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', accountId: 1 }],
  entries: [
    {
      key: { type: 'hd-path', seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', hdPath: "m/44'" },
      address: { type: 'single', value: '0x9d8e3fed246384e726b5962577503b916fb246d7' },
      blockchain: 100,
      id: '8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef-1',
      createdAt: new Date(),
    },
  ],
  createdAt: new Date(),
};

const wallet2: Wallet = {
  id: '1022fd13-3431-4f3b-bce8-109fdab15873',
  name: 'Savings',
  reserved: [{ seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', accountId: 2 }],
  entries: [
    {
      key: { type: 'hd-path', seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', hdPath: "m/44'" },
      address: { type: 'single', value: '0x9d8e3fed246384e726b5962577503b916fb246d7' },
      blockchain: 100,
      id: '1022fd13-3431-4f3b-bce8-109fdab15873-1',
      createdAt: new Date(),
    },
    {
      key: { type: 'hd-path', seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', hdPath: "m/44'" },
      address: { type: 'single', value: '0x577503b916fb246d79d8e3fed246384e726b5962' },
      blockchain: 101,
      id: '1022fd13-3431-4f3b-bce8-109fdab15873-2',
      createdAt: new Date(),
    },
  ],
  createdAt: new Date(),
};

export const wallet3: Wallet = {
  id: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4',
  name: 'My Savings',
  reserved: [{ seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', accountId: 3 }],
  entries: [
    {
      key: { type: 'hd-path', seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', hdPath: "m/44'" },
      address: { type: 'single', value: '0x9d8e3fed246384e726b5962577503b916fb246d7' },
      blockchain: 100,
      id: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
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
      id: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3',
      createdAt: new Date(),
      xpub: [],
    },
  ],
  createdAt: new Date(),
};

export function wallet3SeedAddresses(): Array<[string, string]> {
  return [
    ['m/84\'/0\'/0\'/0/0', 'bc1qqvc28z0kgc7fmdfu440sd7knpgzytgnurszh6t'],
    ['m/84\'/0\'/1\'/0/0', 'bc1q0zsst3yy4k7jx0pv5gry7x0ajppqvkjny3mvg2'],
    ['m/84\'/0\'/2\'/0/0', 'bc1q8uq8207k0k5clg2q836jmvfn8usdqej5fwj27f'],
    ['m/84\'/0\'/3\'/0/0', 'bc1q4zph0rqgf7tphrdyn7zdrxn0zlkf3ufnhjpjq3'],
  ]
}

export const wallet4: Wallet = {
  id: '5c455045-2259-43b3-8e81-5ec9d2be36d6',
  name: 'Current Spending (create from 0xF8806A3bF29025e86C6A45E3c2adCf9117c94f05)',
  reserved: [{ seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', accountId: 1 }],
  entries: [
    {
      key: { type: 'hd-path', seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', hdPath: "m/44'" },
      address: { type: 'single', value: '0xF8806A3bF29025e86C6A45E3c2adCf9117c94f05' },
      blockchain: 100,
      id: '5c455045-2259-43b3-8e81-5ec9d2be36d6-1',
      createdAt: new Date(),
    },
  ],
  createdAt: new Date(),
};

export const wallet5: Wallet = {
  id: '796657ee-99de-4879-87d9-17b2d8c30551',
  name: 'Current Spending (create from 0xCAFEaD4d75D8479242903503425b8c68F4208937)',
  reserved: [{ seedId: 'b00e3378-40e7-4eca-b287-a5ead2f747d4', accountId: 1 }],
  entries: [
    {
      key: { type: 'hd-path', seedId: ledgerSeedId, hdPath: "m/44'/60'/0'/0/0" },
      address: { type: 'single', value: '0xCAFEaD4d75D8479242903503425b8c68F4208937' },
      blockchain: 100,
      id: '796657ee-99de-4879-87d9-17b2d8c30551-1',
      createdAt: new Date(),
    },
  ],
  createdAt: new Date(),
};

export const initLauncher = [
  {
    type: 'LAUNCHER/OPTIONS',
    payload: { 'default_fee.1': '{"max":8192,"min":1024,"std":2048}' },
  },
  {
    type: 'LAUNCHER/TOKENS',
    payload: [
      {
        name: 'Dai Stablecoin',
        blockchain: 100,
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        symbol: 'DAI',
        decimals: 18,
        type: 'ERC20',
        stablecoin: true,
      },
      {
        name: 'Tether USD',
        blockchain: 100,
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        decimals: 6,
        type: 'ERC20',
        stablecoin: true,
      },
    ],
  },
];

export const createSeeds = [
  accounts.actions.setSeedsAction([
    {
      id: ledgerSeedId,
      type: 'ledger',
      createdAt: new Date(),
      available: true,
    },
  ]),
];

export const createWallets = [accounts.actions.setWalletsAction([wallet1, wallet2, wallet3])];

export const setBalances = [
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
  accounts.actions.setBalanceAction({
    address: 'bc1qthnuqj3pn8a6p45369ucre8c5604ntvsf78kxa',
    balance: '45040621/SAT',
    entryId: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3',
    utxo: [
      {
        txid: 'fc883954a9b3a234106f40af04264d56704b9006a9c205ea8ac4c0dc7bab379a',
        vout: 0,
        value: '125000000/SAT',
        address: 'bc1qu2n9ncsl625d4rk2stqcekvpsjk977ke0ey0p3',
      },
      {
        txid: '4d56704b9006a9c205ea8ac4c0dc7bab379afc883954a9b3a234106f40af0426',
        vout: 0,
        value: '45040621/SAT',
        address: 'bc1qthnuqj3pn8a6p45369ucre8c5604ntvsf78kxa',
      },
    ],
  }),
  tokens.actions.setTokenBalance(
    BlockchainCode.ETH,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
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

export const setRates = [
  settings.actions.setRates({
    ETH: '3810.6981',
    ETC: '31.31',
    DAI: '1.001',
    USDT: '0.9985',
    BTC: '68216.29',
  }),
];
