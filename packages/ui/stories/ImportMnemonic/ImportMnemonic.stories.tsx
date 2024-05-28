import { action } from '@storybook/addon-actions';
import {Meta} from '@storybook/react';
import * as React from 'react';
import ImportMnemonic from '../../src/components/accounts/ImportMnemonic';

export default {
  title: 'Import Mnemonic',
  component: ImportMnemonic,
} as Meta;

export const Default = {
  args: {
    onSubmit: action('onSubmit')
  }
};
