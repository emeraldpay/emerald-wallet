import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ErrorDialog from '../../src/components/common/ErrorDialog';

storiesOf('ErrorDialog', module)
  .add('default', () => (<ErrorDialog open={true} handleSubmit={action('handleSubmit')} error={{}}/>));
