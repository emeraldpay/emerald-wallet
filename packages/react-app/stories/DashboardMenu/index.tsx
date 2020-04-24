import { storiesOf } from '@storybook/react';
import * as React from 'react';
import DashboardMenu from '../../src/app/layout/Dashboard/DashboardMenu';

storiesOf('DashboardMenu', module)
  .add('default', () => (
    <DashboardMenu />));
