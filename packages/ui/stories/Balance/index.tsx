import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Balance from '../../src/components/accounts/Balance';

storiesOf('Balance', module)
  .add('default', () => (
    <Balance
      balance={'10501000000000000000'}
      decimals={18}
      symbol='ETC'
      fiatCurrency='USD'
      fiatRate={4.75}
      showFiat={true}
    />));
