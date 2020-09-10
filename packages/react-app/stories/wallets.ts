import {BlockchainCode} from "@emeraldwallet/core";
import {accounts, settings, tokens} from "@emeraldwallet/store";
import {Wallet} from "@emeraldpay/emerald-vault-core";

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

export const setBalances = [
  accounts.actions.setBalanceAction({
    address: "0x9d8e3fed246384e726b5962577503b916fb246d7",
    blockchain: BlockchainCode.ETH,
    value: "918522410056000000000000"
  }),
  accounts.actions.setBalanceAction({
    address: "0x577503b916fb246d79d8e3fed246384e726b5962",
    blockchain: BlockchainCode.ETC,
    value: "498123400000000000000000"
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
    wallet1, wallet2
  ])
];
export const setup = [
  settings.actions.setRatesAction({"ETH": "205.1761", "ETC": "5.234", "DAI": "1.001", "USDT": "0.9985"})
]