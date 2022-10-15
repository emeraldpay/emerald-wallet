import { BlockchainCode } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { CoinAvatar } from '../../src/components/common/CoinIcon';

storiesOf('CoinAvatar', module)
  .add('default', () => (
    <React.Fragment>
      <CoinAvatar blockchain={BlockchainCode.BTC}/>
      <CoinAvatar blockchain={BlockchainCode.ETC}/>
      <CoinAvatar blockchain={BlockchainCode.ETH}/>
      <CoinAvatar blockchain={BlockchainCode.Goerli}/>
      <CoinAvatar blockchain={BlockchainCode.TestBTC}/>
    </React.Fragment>
  ));
