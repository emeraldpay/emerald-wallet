import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '../../src/components/common/Button';

storiesOf('Button', module)
  .add('default', () => (<Button label="button"/>));