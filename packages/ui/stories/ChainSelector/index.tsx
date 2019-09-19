import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ChainSelector from '../../src/components/common/ChainSelector';
import {BlockchainCode, Blockchains} from '@emeraldwallet/core';

const blockchains = [
  Blockchains[BlockchainCode.ETC],
  Blockchains[BlockchainCode.ETH]
];

storiesOf('ChainSelector', module)
  .add('default', () => (<ChainSelector chains={blockchains} onChange={action('onChange')} />));
