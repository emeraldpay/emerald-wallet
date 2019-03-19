import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ErrorDialog from '../../src/components/common/ErrorDialog';

storiesOf('ErrorDialog', module)
  .add('default', () => (<ErrorDialog open={true}/>));