import {BlockchainCode} from "@emeraldwallet/core";
import {accounts, settings, tokens} from "@emeraldwallet/store";
import {Wallet} from "@emeraldpay/emerald-vault-core";

export const ledgerSeedId = "7befa8b6-670d-467a-8ddd-a9615087ba14";

const wallet1: Wallet = {
  id: "8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef",
  name: "Current Spending (create from 0x9d8e3fed246384e726b5962577503b916fb246d7)",
  reserved: [
    {seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", accountId: 1}
  ],
  entries: [
    {
      key: {type: "seed-hd", seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", hdPath: "m/44'"},
      address: {type: "single", value: "0x9d8e3fed246384e726b5962577503b916fb246d7"},
      blockchain: 100,
      id: "8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef-1",
      createdAt: new Date()
    }
  ],
  createdAt: new Date()
};

const wallet2: Wallet = {
  id: "1022fd13-3431-4f3b-bce8-109fdab15873",
  name: "Savings",
  reserved: [
    {seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", accountId: 2}
  ],
  entries: [
    {
      key: {type: "seed-hd", seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", hdPath: "m/44'"},
      address: {type: "single", value: "0x9d8e3fed246384e726b5962577503b916fb246d7"},
      blockchain: 100,
      id: "1022fd13-3431-4f3b-bce8-109fdab15873-1",
      createdAt: new Date()
    },
    {
      key: {type: "seed-hd", seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", hdPath: "m/44'"},
      address: {type: "single", value: "0x577503b916fb246d79d8e3fed246384e726b5962"},
      blockchain: 101,
      id: "1022fd13-3431-4f3b-bce8-109fdab15873-2",
      createdAt: new Date()
    },
  ],
  createdAt: new Date()
};

export const wallet3: Wallet = {
  id: "f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4",
  name: "Another Wallet",
  reserved: [
    {seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", accountId: 3}
  ],
  entries: [
    {
      key: {type: "seed-hd", seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", hdPath: "m/44'"},
      address: {type: "single", value: "0x9d8e3fed246384e726b5962577503b916fb246d7"},
      blockchain: 100,
      id: "f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1",
      createdAt: new Date()
    },
    {
      // seed: lake cupboard yellow project spoil era educate behind move slide fluid early purpose stone panel
      key: {type: "seed-hd", seedId: "b00e3378-40e7-4eca-b287-a5ead2f747d4", hdPath: "m/84'/0'/3'/0/0"},
      address: {
        type: "xpub",
        value: "zpub6trp3XEQXBogyby8NUy5xg5qykZAMnC7e4apsn1kNXhtGs3TKVpKS8P4DXMKuy56yKkLwgAYnWsMd9PzGnTdWAHoiwvRLwfAZ58ajkbVudW"
      },
      addresses: [
        {role: "receive", hdPath: "m/84'/0'/3'/0/2", address: "bc1qa2s34p38jyuen859slf28nnvccauk6xuwqzug4"}
      ],
      blockchain: 1,
      id: "f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3",
      createdAt: new Date(),
      xpub: []
    },
  ],
  createdAt: new Date()
};

export const setBalances = [
  accounts.actions.setBalanceAction({
    entryId: "1022fd13-3431-4f3b-bce8-109fdab15873-1",
    value: "918522410056000000000000/WEI"
  }),
  accounts.actions.setBalanceAction({
    entryId: "1022fd13-3431-4f3b-bce8-109fdab15873-2",
    value: "498123400000000000000000/WEI"
  }),
  accounts.actions.setBalanceAction({
    entryId: "f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3",
    value: "",
    utxo: [
      {
        txid: "fc883954a9b3a234106f40af04264d56704b9006a9c205ea8ac4c0dc7bab379a",
        vout: 0,
        value: "125000000/SAT",
        address: "bc1qu2n9ncsl625d4rk2stqcekvpsjk977ke0ey0p3",
      },
      {
        txid: "4d56704b9006a9c205ea8ac4c0dc7bab379afc883954a9b3a234106f40af0426",
        vout: 0,
        value: "45040621/SAT",
        address: "bc1qthnuqj3pn8a6p45369ucre8c5604ntvsf78kxa",
      }
    ]
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

export const createWallets = [
  accounts.actions.setWalletsAction([
    wallet1, wallet2, wallet3
  ])
];
export const setup = [
  settings.actions.setRatesAction({
    "ETH": "205.1761",
    "ETC": "5.234",
    "DAI": "1.001",
    "USDT": "0.9985",
    "BTC": "11407.35"
  })
]