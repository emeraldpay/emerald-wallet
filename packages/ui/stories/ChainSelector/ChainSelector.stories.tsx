import { BlockchainCode, Blockchains } from '@emeraldwallet/core';
import { action } from '@storybook/addon-actions';
import {Meta} from '@storybook/react';
import * as React from 'react';
import ChainSelector from '../../src/components/common/ChainSelector';

const blockchains = [Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.BTC]];

export default {
  title: 'Chain Selector',
  component: ChainSelector,
} as Meta;

export const Default = {
  args: {
    blockchains: blockchains,
    onChange: action('onChange')
  }
};
