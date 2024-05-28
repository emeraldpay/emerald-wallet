import { action } from '@storybook/addon-actions';
import {Meta} from '@storybook/react';
import * as React from 'react';
import WaitLedger from '../../src/ledger/WaitLedger';
import withProvider from '../storeProvider';

export default {
  title: 'Ledger Wait',
  decorators: [withProvider],
} as Meta;

export const Default = () => <WaitLedger onConnected={action('Connected')} />;
