import { action } from '@storybook/addon-actions';
import {Meta} from '@storybook/react';
import * as React from 'react';
import ImportPk from '../../src/components/accounts/ImportPk';

export default {
  title: 'Import Pk',
  component: ImportPk,
} as Meta;

export const Default = {
  args: {
    raw: true,
    checkGlobalKey: () => Promise.resolve(true),
    onChange: action('onChange')
  }
};
