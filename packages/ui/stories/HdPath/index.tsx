import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import HdPath from '../../src/components/common/HdPath';

storiesOf('HdPath', module)
  .add('default', () => (<HdPath onChange={action('onChange')} />));
