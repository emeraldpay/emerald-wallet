import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import WaitLedger from '../../src/ledger/WaitLedger';
import withProvider from '../storeProvider';
import withTheme from '../themeProvider';

storiesOf('WaitLedger', module)
  .addDecorator(withProvider)
  .addDecorator(withTheme)
  .add('default', () => <WaitLedger onConnected={action('Connected')} />)
  .add('full size', () => <WaitLedger fullSize onConnected={action('Connected')} />);
