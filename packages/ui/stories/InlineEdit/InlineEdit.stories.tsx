import {Meta} from '@storybook/react';
import * as React from 'react';
import InlineEdit from '../../src/components/common/InlineEdit';

export default {
  title: 'InlineEdit',
  component: InlineEdit,
} as Meta;

export const Default = {
  args: {
    placeholder: 'Account name',
    initialValue: 'initial name'
  }
};
