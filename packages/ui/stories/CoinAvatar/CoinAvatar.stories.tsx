import { BlockchainCode } from '@emeraldwallet/core';
import {Meta} from '@storybook/react';
import * as React from 'react';
import { BlockchainAvatar } from '../../src/components/common/BlockchainAvatar';


export default {
  title: 'Coin Avatar',
  component: BlockchainAvatar,
} as Meta;

export const Default = {
  args: {
    blockchain: BlockchainCode.ETH
  }
};

export const Sepolia = {
  args: {
    blockchain: BlockchainCode.Sepolia
  }
};

export const TestBTC = {
  args: {
    blockchain: BlockchainCode.TestBTC
  }
};

export const ETC = {
  args: {
    blockchain: BlockchainCode.ETC
  }
};

export const BTC = {
  args: {
    blockchain: BlockchainCode.BTC
  }
};

