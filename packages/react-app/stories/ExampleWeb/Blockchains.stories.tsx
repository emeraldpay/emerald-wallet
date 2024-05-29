import {BlockchainCode} from '@emeraldwallet/core';
import type {Meta, StoryObj} from '@storybook/react';
import SelectHDPath from '../../src/create-account/SelectHDPath';
import {createSeeds, createWallets, initLauncher, ledgerSeedId} from "../wallets";
import {providerForStore} from "../storeProvider";
import {createNew} from './data';
import {accounts} from "@emeraldwallet/store";

const { api, backend} = createNew()

let seedId = 'e23378da-d4b2-4843-ae4d-f42888a11b58';

api.vault.addSeedAddress(
  seedId,
  "m/44'/60'/0'/0/0",
  '0xc4cf138d349ead73f7a93306096a626c40f56653',
);
api.vault.addSeedAddress(
  seedId,
  "m/84'/0'/0'/0/0",
  'bc1qqvc28z0kgc7fmdfu440sd7knpgzytgnurszh6t',
);

let configure = [
  accounts.actions.setSeedsAction([
    {
      id: seedId,
      type: 'mnemonic',
      createdAt: new Date(),
      available: true,
    },
  ]),
]


export default {
  title: 'Example Web / Multiple Blockchains',
  component: SelectHDPath,
  decorators: [providerForStore(api, backend, [...initLauncher, ...configure])],
} as Meta;

type Story = StoryObj<typeof SelectHDPath>;

export const Default: Story = {
  name: 'Multiple Blockchains',
  args: {
    seed: { type: 'id', value: seedId },
    blockchains: [BlockchainCode.BTC, BlockchainCode.ETH],
    onChange: (accountId, indexes) => console.log('Account selected', accountId, indexes),
  }
};
