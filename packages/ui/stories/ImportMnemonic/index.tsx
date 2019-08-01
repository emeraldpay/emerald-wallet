import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ImportMnemonic from '../../src/components/accounts/ImportMnemonic';

storiesOf('ImportMnemonic', module)
  .add('default', () => (<ImportMnemonic blockchains={[]} initialValues={{hdpath: ''}} onSubmit={action('onSubmit')}/>));
