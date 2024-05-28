import {BlockchainCode} from '@emeraldwallet/core';
import type {Meta, StoryObj} from '@storybook/react';
import SelectHDPath from '../../src/create-account/SelectHDPath';
import {createSeeds, xpubSeedId} from "../wallets";
import {providerForStore} from "../storeProvider";
import {createNew} from './data';

const { api, backend} = createNew();

const meta: Meta<typeof SelectHDPath> = {
  title: 'Create Account',
  component: SelectHDPath,
  decorators: [
    //@ts-ignore
    providerForStore(api, backend, [...createSeeds])
  ]
};
export default meta;

type Story = StoryObj<typeof SelectHDPath>;

export const SelectAccount: Story = {
  name: 'Select Account / Base',
  args: {
    seed: { type: 'id', value: 'e23378da-d4b2-4843-ae4d-f42888a11b58' },
    blockchains: [BlockchainCode.BTC, BlockchainCode.ETH],
    onChange: (accountId, indexes) => console.log('Account selected', accountId, indexes),
  }
};

export const SelectAccountETH: Story = {
  name: 'Select Account / Only ETH',
  args: {
    seed: { type: 'id', value: 'e23378da-d4b2-4843-ae4d-f42888a11b58' },
    blockchains: [BlockchainCode.ETH],
    onChange: (accountId, indexes) => console.log('Account selected', accountId, indexes),
  }
};

export const SelectAccountXpub: Story = {
  name: 'Select Account / Xpub',
  args: {
    seed: { type: 'id', value: xpubSeedId },
    blockchains: [BlockchainCode.BTC, BlockchainCode.ETH],
    onChange: (accountId, indexes) => console.log('Account selected', accountId, indexes),
  }
};
