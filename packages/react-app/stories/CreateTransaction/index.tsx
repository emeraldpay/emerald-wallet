import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { TxAction, accounts, tokens } from '@emeraldwallet/store';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { CreateTransaction } from '../../src/transaction';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';

const api = new MemoryApiMock();
const backend = new BackendMock();

const entries: WalletEntry[] = [
  {
    id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-0',
    address: {
      type: 'xpub',
      value: 'vpub_common',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/84'/1'/0'/0/0",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    xpub: [
      {
        role: 'receive',
        xpub: 'vpub_receive',
      },
      {
        role: 'change',
        xpub: 'vpub_change',
      },
    ],
    blockchain: 1,
    createdAt: new Date(),
    addresses: [],
  },
  {
    id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
    address: {
      type: 'single',
      value: '0x0',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'/60'/0'/0/0",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 100,
    createdAt: new Date(),
  },
  {
    id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-2',
    address: {
      type: 'single',
      value: '0x1',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'/61'/0'/0/0'",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 101,
    createdAt: new Date(),
  },
];

api.vault.addEntry('2a19e023-f119-4dab-b2cb-4b3e73fa32c9-0', {
  address: 'addr',
  hdPath: "m/84'/1'/0'/1/0",
  role: 'change',
});

storiesOf('CreateTransaction', module)
  .addDecorator(
    providerForStore(api, backend, [
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
          {
            name: 'Wrapped Ether',
            blockchain: 101,
            address: '0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a',
            symbol: 'WETC',
            decimals: 18,
            type: 'ERC20',
          },
        ],
      },
      accounts.actions.setBalanceAction({
        address: 'tb1',
        balance: '100000000/SAT',
        entryId: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-0',
        utxo: [
          {
            address: 'tb1',
            txid: 'tx_0',
            value: '100000000/SAT',
            vout: 0,
          },
        ],
      }),
      accounts.actions.setBalanceAction({
        address: '0x0',
        balance: '1000000000000000000/WEI',
        entryId: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
      }),
      accounts.actions.setBalanceAction({
        address: '0x1',
        balance: '1000000000000000000/WEI',
        entryId: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-2',
      }),
      tokens.actions.setTokenBalance(BlockchainCode.ETH, '0x0', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', {
        decimals: 18,
        symbol: 'WETH',
        unitsValue: '1000000000000000000',
      }),
      tokens.actions.setTokenBalance(BlockchainCode.ETC, '0x1', '0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a', {
        decimals: 18,
        symbol: 'WETC',
        unitsValue: '1000000000000000000',
      }),
    ]),
  )
  .addDecorator(withTheme)
  .add('transfer', () => <CreateTransaction entryId="2a19e023-f119-4dab-b2cb-4b3e73fa32c9-0" />)
  .add('approve', () => (
    <CreateTransaction action={TxAction.APPROVE} entryId="2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1" />
  ))
  .add('convert', () => (
    <CreateTransaction action={TxAction.CONVERT} entryId="2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1" />
  ));
