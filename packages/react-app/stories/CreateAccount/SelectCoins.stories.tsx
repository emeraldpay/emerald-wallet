import {BlockchainCode, Blockchains} from '@emeraldwallet/core';
import type {Meta, StoryObj} from '@storybook/react';
import {createSeeds, xpubSeedId} from "../wallets";
import {providerForStore} from "../storeProvider";
import {createNew} from './data';
import SelectCoins from '../../src/create-account/SelectBlockchains';
import {action} from "@storybook/addon-actions";

const { api, backend} = createNew();

const meta: Meta<typeof SelectCoins> = {
  title: 'Create Account',
  component: SelectCoins,
  decorators: [
    //@ts-ignore
    providerForStore(api, backend, [...createSeeds])
  ]
};
export default meta;

type Story = StoryObj<typeof SelectCoins>;

export const Empty: Story = {
  name: 'Select Blockchain / Empty',
  args: {
    multiple: true,
    blockchains: [Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.ETC]],
    enabled: [],
    onChange: action('selected')
  }
};

export const OneSet: Story = {
  name: 'Select Blockchain / One Set',
  args: {
    multiple: true,
    blockchains: [Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.ETC]],
    enabled: [BlockchainCode.ETH],
    onChange: action('selected')
  }
};

export const Single: Story = {
  name: 'Select Blockchain / Single',
  args: {
    multiple: false,
    blockchains: [Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.ETC]],
    enabled: [],
    onChange: action('selected')
  }
};
