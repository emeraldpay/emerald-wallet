import { BlockchainCode } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { CoinAvatar } from '../../src/components/common/CoinIcon';

storiesOf('CoinAvatar', module)
  .add('default', () => (
    <React.Fragment>
      <CoinAvatar chain={BlockchainCode.BTC}/>
      <CoinAvatar chain={BlockchainCode.TestBTC}/>
      <CoinAvatar chain={BlockchainCode.ETC}/>
      <CoinAvatar chain={BlockchainCode.ETH}/>
      <CoinAvatar chain={BlockchainCode.Kovan}/>

      <CoinAvatar chain={"USD"}/>
      <CoinAvatar chain={"USDT"}/>
      <CoinAvatar chain={"DAI"}/>
    </React.Fragment>
  ));
