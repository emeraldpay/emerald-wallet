import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Header from '../../src/components/tx/TxHistory/Header';

storiesOf('TxHistory', module)
  .add('Header', () => (<Header />));
