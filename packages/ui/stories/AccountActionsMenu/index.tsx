import * as React from 'react';
import { storiesOf } from '@storybook/react';
import AccountActionsMenu from '../../src/components/accounts/AccountActionsMenu';

storiesOf('AccountActionsMenu', module)
  .add('default', () => (<AccountActionsMenu canHide={true} showPrint={true} showExport={true} hiddenAccount={false} chain="etc" />));