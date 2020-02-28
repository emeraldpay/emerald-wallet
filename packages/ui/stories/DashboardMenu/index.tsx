import { storiesOf } from '@storybook/react';
import * as React from 'react';
import DashboardMenu from '../../src/components/layout/DashboardMenu';

storiesOf('DashboardMenu', module)
  .add('default', () => (
    <DashboardMenu />));
