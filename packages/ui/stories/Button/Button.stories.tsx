import { Meta } from '@storybook/react';
import * as React from 'react';
import Button from '../../src/components/common/Button';

export default {
  title: 'Button',
  component: Button,
} as Meta;

export const Default = {
  args: {
    label: "A Button"
  }
};

export const PrimaryButton = {
  args: {
    label: "A Button",
    primary: true,
  }
};
