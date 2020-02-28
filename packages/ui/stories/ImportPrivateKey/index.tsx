import { Blockchain, BlockchainCode, Blockchains } from '@emeraldwallet/core';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ImportPrivateKey from '../../src/components/accounts/ImportPrivateKey';

const chains: Blockchain[] = [
  Blockchains[BlockchainCode.ETC],
  Blockchains[BlockchainCode.ETH]
];

storiesOf('ImportPrivateKey', module)
  .add('default', () => (
    <ImportPrivateKey blockchains={chains} onSubmit={action('onSubmit')}/>
    ));
