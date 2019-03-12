import * as React from 'react';
import { storiesOf } from '@storybook/react';
import InlineEdit from '../../src/components/common/InlineEdit';

storiesOf('InlineEdit', module)
  .add('default', () => (<InlineEdit placeholder="Account name" initialValue="initial name" />));