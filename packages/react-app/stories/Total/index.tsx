import { Units } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TotalButton from '../../src/app/layout/Header/TotalButton';

storiesOf('TotalButton', module)
  .add('default', () => (
    <TotalButton
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
