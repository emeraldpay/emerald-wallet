import {storiesOf} from '@storybook/react';
import * as React from 'react';
import Balance from '../../src/components/accounts/Balance';
import {Wei} from "@emeraldpay/bigamount-crypto";
import {tokenAmount} from "@emeraldwallet/core";
import {Satoshi} from "@emeraldpay/bigamount-crypto/lib/bitcoin";

storiesOf('Balance', module)
  .add('ethereum 10.501', () => (
    <Balance
      balance={new Wei('10501000000000000000')}
    />))
  .add('dai', () => (
    <Balance
      balance={tokenAmount('10501000000000000000', 'dai')}
    />))
  .add('bitcoin 0.1', () => (
    <Balance
      balance={new Satoshi('10000000')}
    />))
;
