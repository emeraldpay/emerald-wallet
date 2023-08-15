import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import PasswordInput from '../../src/components/common/PasswordInput';
import ConfirmedPasswordInput from '../../src/components/common/PasswordInput/ConfirmedPasswordInput';

storiesOf('PasswordInput', module)
  .add('default', () => <PasswordInput onChange={action('onChange')} />)
  .add('with error', () => <PasswordInput onChange={action('onChange')} error="Error message" />)
  .add('minimum 5 chars', () => <PasswordInput minLength={5} onChange={action('onChange')} />)
  .add('less than min and error', () => <PasswordInput error="external Error" onChange={action('onChange')} />)
  .add('confirmation', () => <ConfirmedPasswordInput onChange={action('onChange')} />);
