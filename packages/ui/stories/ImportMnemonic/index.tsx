import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ImportMnemonic from '../../src/components/accounts/ImportMnemonic';
import {BlockchainCode, Blockchains, IBlockchain} from "@emeraldwallet/core";

storiesOf('ImportMnemonic', module)
  .add('default', () => (
    <ImportMnemonic blockchains={[Blockchains[BlockchainCode.ETH]]}
                    initialValues={{hdpath: ''}}
                    onSubmit={action('onSubmit')}/>));
