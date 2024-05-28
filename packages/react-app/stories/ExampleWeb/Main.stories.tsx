import {BlockchainCode} from '@emeraldwallet/core';
import type {Meta, StoryObj} from '@storybook/react';
import {createSeeds, xpubSeedId} from "../wallets";
import {providerForStore} from "../storeProvider";
import {createNew} from './data';
import HDPathCounter from "../../src/create-account/HDPathCounter";
import {action} from "@storybook/addon-actions";

const { api, backend} = createNew();

const meta: Meta<typeof HDPathCounter> = {
  title: 'Example Web',
  component: HDPathCounter,
  decorators: [
    //@ts-ignore
    providerForStore(api, backend, [...createSeeds])
  ]
};
export default meta;

type Story = StoryObj<typeof HDPathCounter>;

export const Base: Story = {
  name: 'HDPath Counter / Base',
  args: {
    base: "m/44'/60'/0'/0/0",
    onChange: action('changed')
  }
};
