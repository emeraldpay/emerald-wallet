import React from 'react';
import { storiesOf } from '@storybook/react';
import PasswordInput from '../../src/elements/PasswordInput';

storiesOf('PasswordInput', module)
  .add('default', () => (<PasswordInput />))
  .add('with error', () => (<PasswordInput error='Error message'/>));
