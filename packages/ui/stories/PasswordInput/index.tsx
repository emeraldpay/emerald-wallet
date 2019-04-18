import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import PasswordInput from '../../src/components/common/PasswordInput';

storiesOf('PasswordInput', module)
  .add('default', () => (<PasswordInput onChange={action('onChange')}/>))
  .add('with error', () => (<PasswordInput onChange={action('onChange')} error='Error message'/>));
