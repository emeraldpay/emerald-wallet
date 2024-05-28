import { Wei } from '@emeraldpay/bigamount-crypto';
import { CurrencyAmount } from '@emeraldwallet/core';
import {Meta} from '@storybook/react';
import * as React from 'react';
import TotalButton from '../../src/app/layout/Header/TotalButton';

export default {
  title: 'Total',
} as Meta;

export const Default = () =>
  <TotalButton
    balances={[
      {
        balance: Wei.ZERO,
        fiatBalance: new CurrencyAmount(0, 'USD'),
      },
    ]}
    loading={false}
    totalBalance={new CurrencyAmount(0, 'USD')}
  />;
