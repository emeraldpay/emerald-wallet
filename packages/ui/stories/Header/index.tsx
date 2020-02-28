import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Status from '../../src/components/layout/Header/Status';

const chains = [
  { title: 'Ethereum', id: 'eth', height: 3330 },
  { title: 'Ethereum Classic', id: 'etc', height: 5000 }
];

storiesOf('Header', module)
  .add('Status', () => (<Status blockchains={chains} />));
