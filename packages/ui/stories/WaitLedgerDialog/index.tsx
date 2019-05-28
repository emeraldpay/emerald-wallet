import * as React from 'react';
import { storiesOf } from '@storybook/react';
import WaitDialog from '../../src/components/ledger/WaitDialog';

storiesOf('WaitLedgerDialog', module)
  .add('default', () => (<WaitDialog />));
