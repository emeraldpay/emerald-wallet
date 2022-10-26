import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ErrorDialog from '../../src/components/common/ErrorDialog';

storiesOf('ErrorDialog', module).add('default', () => (
  <ErrorDialog open={true} handleClose={action('handleClose')} handleSubmit={action('handleSubmit')} />
));
