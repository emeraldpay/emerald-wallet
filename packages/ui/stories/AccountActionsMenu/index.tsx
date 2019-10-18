import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import AccountActionsMenu from '../../src/components/accounts/AccountActionsMenu';

storiesOf('AccountActionsMenu', module)
  .add('default', () => (
    <AccountActionsMenu
      onPrint={action('onPrint')}
      canHide={true}
      showPrint={true}
      showExport={true}
      hiddenAccount={false}
    />
    ));
