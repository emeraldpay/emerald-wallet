import { BlockchainCode } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { BlockchainAvatar } from '../../src/components/common/BlockchainAvatar';

storiesOf('BlockchainAvatar', module).add('default', () => (
  <React.Fragment>
    <BlockchainAvatar blockchain={BlockchainCode.BTC} />
    <BlockchainAvatar blockchain={BlockchainCode.ETC} />
    <BlockchainAvatar blockchain={BlockchainCode.ETH} />
    <BlockchainAvatar blockchain={BlockchainCode.Sepolia} />
    <BlockchainAvatar blockchain={BlockchainCode.TestBTC} />
  </React.Fragment>
));
