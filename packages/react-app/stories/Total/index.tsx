import { Wei } from '@emeraldpay/bigamount-crypto';
import { CurrencyAmount } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TotalButton from '../../src/app/layout/Header/TotalButton';

storiesOf('TotalButton', module).add('default', () => (
  <TotalButton
    fiatCurrencies={[
      {
        token: 'ETH',
        total: Wei.ZERO,
        fiatRate: 200,
        fiatAmount: new CurrencyAmount(0, 'USD'),
      },
    ]}
    totalBalance={new CurrencyAmount(0, 'USD')}
  />
));
