import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Settings from '../../src/components/Settings';

storiesOf('Settings', module)
  .add('default', () => (
    <Settings
      numConfirmations={5}
      currency="RUB"
      language="ru"
      showHiddenAccounts={true}
      t={(l) => (l)}
    />));