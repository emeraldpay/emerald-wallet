import { storiesOf } from '@storybook/react';
import * as React from 'react';
import InlineEdit from '../../src/components/common/InlineEdit';

storiesOf('InlineEdit', module)
  .add('default', () => (<InlineEdit placeholder='Account name' initialValue='initial name' />));
