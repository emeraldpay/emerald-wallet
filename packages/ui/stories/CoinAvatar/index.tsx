import { BlockchainCode, CurrencyCode } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { CoinAvatar } from '../../src/components/common/CoinIcon';

storiesOf('CoinAvatar', module)
  .add('default', () => (
    <React.Fragment>
      <CoinAvatar code={BlockchainCode.BTC}/>
      <CoinAvatar code={BlockchainCode.TestBTC}/>
      <CoinAvatar code={BlockchainCode.ETC}/>
      <CoinAvatar code={BlockchainCode.ETH}/>
      <CoinAvatar code={CurrencyCode.USD}/>
      <CoinAvatar code={'DAI'}/>
      <CoinAvatar code={'USDT'}/>
    </React.Fragment>
  ));
