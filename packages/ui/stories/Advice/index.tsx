import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Advice from '../../src/components/common/Advice';

storiesOf('Advice', module)
  .add('default', () => (<Advice title="Be careful" text="They are watching you"/>));
