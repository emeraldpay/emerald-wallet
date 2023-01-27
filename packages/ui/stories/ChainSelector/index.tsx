import { BlockchainCode, Blockchains } from '@emeraldwallet/core';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ChainSelector from '../../src/components/common/ChainSelector';

const blockchains = [Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.ETC]];

storiesOf('ChainSelector', module).add('default', () => (
  <ChainSelector blockchains={blockchains} onChange={action('onChange')} />
));
