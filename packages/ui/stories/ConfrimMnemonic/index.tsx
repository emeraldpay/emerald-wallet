import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ConfirmMnemonic from '../../src/components/accounts/ConfirmMnemonic';

const str = 'line1\r\nline2\r\nline3\r\nline4';

storiesOf('ConfirmMnemonic', module)
  .add('default', () => (<ConfirmMnemonic mnemonic={str} dpath={"m/44'"} />));
