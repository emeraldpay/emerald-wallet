import {storiesOf} from '@storybook/react';
import * as React from 'react';
import TotalButton from '../../src/app/layout/Header/TotalButton';
import {CurrencyAmount} from "@emeraldwallet/core";
import {Wei} from "@emeraldpay/bigamount-crypto";

storiesOf('TotalButton', module)
  .add('default', () => (
    <TotalButton
      total={new CurrencyAmount(0, "USD")}
      byChain={[
        {
          token: 'ETH',
          total: Wei.ZERO,
          fiatRate: 200,
          fiatAmount: new CurrencyAmount(0, "USD")
        }
      ]}
    />
    ));
