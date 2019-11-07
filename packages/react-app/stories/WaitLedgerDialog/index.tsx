import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import WaitDialog from '../../src/ledger/WaitDialog';

storiesOf('WaitLedgerDialog', module)
  .add('default', () => (<WaitDialog onClickBuyLedger={action('onClickBuyLedger')}/>));
