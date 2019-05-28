import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ExportPaperWallet from '../../src/components/accounts/ExportPaperWallet';

storiesOf('ExportPaperWallet', module)
  .add('default', () => (<ExportPaperWallet accountId="0x1234" onSubmit={action('onSubmit')}/>));
