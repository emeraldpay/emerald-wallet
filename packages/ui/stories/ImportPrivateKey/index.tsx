import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ImportPrivateKey from '../../src/components/accounts/ImportPrivateKey';

storiesOf('ImportPrivateKey', module)
  .add('default', () => (<ImportPrivateKey blockchains={[]} onSubmit={action('onSubmit')}/>));
