import {Meta, type StoryObj} from '@storybook/react';
import * as React from 'react';
import Address from '../../src/components/accounts/Address';

export default {
  title: 'Address',
  component: Address,
} as Meta<typeof Address>;

type Story = StoryObj<typeof Address>;

export const EthereumCopy = {
  args: {
    address: "0x9d8e3fed246384e726b5962577503b916fb246d7",
    onCopy: console.log
  }
};
export const EthereumNoCopy = {
  args: {
    address: "0x9d8e3fed246384e726b5962577503b916fb246d7",
    disableCopy: true
  }
};

export const BitcoinCopy = {
  args: {
    address: "bc1qa2s34p38jyuen859slf28nnvccauk6xuwqzug4",
    onCopy: console.log
  }
};

export const BitcoinNoCopy = {
  args: {
    address: "bc1qa2s34p38jyuen859slf28nnvccauk6xuwqzug4",
    disableCopy: true
  }
};
