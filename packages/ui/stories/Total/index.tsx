import { AnyCoinCode, CurrencyCode, StableCoinCode, Units } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Total from '../../src/components/layout/Header/Total';

storiesOf('Total', module)
  .add('default', () => (
    <Total
      total={Units.ZERO}
      byChain={[
        {
          token: 'ETH',
          total: Units.ZERO,
          fiatRate: 200,
          fiatAmount: Units.ZERO
        }
      ]}
    />
    ));
