import { action } from '@storybook/addon-actions';
import {Meta} from '@storybook/react';
import * as React from 'react';
import ConfirmedPasswordInput from '../../src/components/common/PasswordConfirmedInput';
import PasswordInput from '../../src/components/common/PasswordInput';


export default {
  title: 'PasswordInput',
  component: PasswordInput,
} as Meta

export const Default = {
  args: {
    onChange: action('onChange')
  }
};

export const WithError = {
  args: {
    onChange: action('onChange'),
    error: "Error message"
  }
};

export const Minimum5Chars = {
  args: {
    onChange: action('onChange'),
    minLength: 5
  }
};

export const LessThanMinAndError = {
  args: {
    onChange: action('onChange'),
    error: "external Error"
  }
};

export const Confirmation = {
  render: () => <ConfirmedPasswordInput onChange={action('onChange')} />
};
