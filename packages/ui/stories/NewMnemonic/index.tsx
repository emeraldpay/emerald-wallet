import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import NewMnemonic from '../../src/components/accounts/NewMnemonic';

const str = "line1\r\nline2\r\nline3\r\nline4";

storiesOf('NewMnemonic', module)
  .add('default', () => (<NewMnemonic mnemonic={str} />));
