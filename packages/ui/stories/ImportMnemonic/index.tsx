import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ImportMnemonic from '../../src/components/accounts/ImportMnemonic';

storiesOf('ImportMnemonic', module)
  .add('default', () => (
    <ImportMnemonic blockchains={[]} initialValues={{ hdpath: '' }} onSubmit={action('onSubmit')}/>));
