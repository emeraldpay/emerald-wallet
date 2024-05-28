import { Meta } from '@storybook/react';
import * as React from 'react';
import Advice from '../../src/components/common/Advice';

export default {
  title: 'Advice',
  component: Advice,
} as Meta;

export const Default = {
  args: {
    title: 'Be careful',
    text: 'They are watching you'
  }
};
