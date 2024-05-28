import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import * as React from 'react';
import ErrorDialog from '../../src/components/common/ErrorDialog';

export default {
  title: 'Error Dialog',
  component: ErrorDialog,
} as Meta;

export const Default = {
  args: {
    open: true,
    handleClose: action('handleClose'),
    handleSubmit: action('handleSubmit')
  }
};
