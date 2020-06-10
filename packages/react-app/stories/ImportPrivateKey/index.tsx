import { BlockchainCode, Blockchains, IBlockchain } from '@emeraldwallet/core';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ImportPrivateKey from '../../src/create-account/ImportPrivateKey/ImportPkForm';

const chains: IBlockchain[] = [
  Blockchains[BlockchainCode.ETC],
  Blockchains[BlockchainCode.ETH]
];

storiesOf('ImportPrivateKey', module)
  .add('default', () => (
    <ImportPrivateKey onSubmit={action('onSubmit')}/>
    ));
