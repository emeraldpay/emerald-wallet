import {providerForStore} from "../storeProvider";
import {Meta} from "@storybook/react";
import * as React from 'react';
import {accounts, allowances, tokens} from "@emeraldwallet/store";
import {BackendMock, MemoryApiMock} from "../__mocks__";
import {WalletEntry} from "@emeraldpay/emerald-vault-core";
import {BlockchainCode} from "@emeraldwallet/core";
import WalletAllowance from "../../src/wallets/WalletDetails/WalletAllowance";
import {tokenDAI, tokenWETH} from "../wallets";

const api = new MemoryApiMock();
const backend = new BackendMock();

const entries: WalletEntry[] = [
  {
    id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
    address: {
      type: 'single',
      value: '0x1d1C7DB10aa1a6067Ba81F0Dd6FD4F26FC594f13',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'/60'/0'/0/0",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 100,
    createdAt: new Date(),
  },
];

let actions = [
  accounts.actions.setWalletsAction([
    {
      entries,
      id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9',
      createdAt: new Date(),
    },
  ]),
  {
    type: 'LAUNCHER/TOKENS',
    payload: [
      {
        name: 'Wrapped Ether',
        blockchain: 100,
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        decimals: 18,
        type: 'ERC20',
      },
    ],
  },

  accounts.actions.setBalanceAction({
    address: '0x0',
    balance: '1000000000000000000/WEI',
    entryId: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
  }),
  tokens.actions.setTokenBalance(BlockchainCode.ETH, '0x0', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', {
    decimals: 18,
    symbol: 'WETH',
    unitsValue: '1000000000000000000',
  }),

  allowances.actions.setAllowance({
    address: '0x1d1C7DB10aa1a6067Ba81F0Dd6FD4F26FC594f13',
    allowance: "1000000000000000000",
    available: "700000000000000000",
    blockchain: BlockchainCode.ETH,
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    ownerAddress: "0x1d1C7DB10aa1a6067Ba81F0Dd6FD4F26FC594f13",
    spenderAddress: "0x7992586aCaEcA5b19B973c1cd12B695131c0B736",
    timestamp: Date.now() - 12345678,
  }, [
    tokenWETH, tokenDAI
  ]),

  allowances.actions.setAllowance({
    address: '0x1d1C7DB10aa1a6067Ba81F0Dd6FD4F26FC594f13',
    allowance: "20000000000000000000000",
    available: "17500000000000000000",
    blockchain: BlockchainCode.ETH,
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    ownerAddress: "0x1d1C7DB10aa1a6067Ba81F0Dd6FD4F26FC594f13",
    spenderAddress: "0x7992586aCaEcA5b19B973c1cd12B695131c0B736",
    timestamp: Date.now() - 12345678,
  }, [
    tokenWETH, tokenDAI
  ]),

  allowances.actions.setAllowance({
    address: '0x1d1C7DB10aa1a6067Ba81F0Dd6FD4F26FC594f13',
    allowance: "99000000000000000000000000000000000000000000",
    available: "9161660000000000000",
    blockchain: BlockchainCode.ETH,
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    ownerAddress: "0xCb1c1a86bcae979B971c192Cc5D2B6551311B73e",
    spenderAddress: "0x1d1C7DB10aa1a6067Ba81F0Dd6FD4F26FC594f13",
    timestamp: Date.now() - 12345678,
  }, [
    tokenWETH, tokenDAI
  ]),

];


export default {
  title: 'Example Web / ERC20 Allowance',
  decorators: [providerForStore(api, backend, actions),],
} as Meta;

export const Default = {
  name: 'ERC20 Allowance',
  render: () => <WalletAllowance walletId="2a19e023-f119-4dab-b2cb-4b3e73fa32c9" />
};
