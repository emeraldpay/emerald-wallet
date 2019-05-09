import * as React from 'react';
import { storiesOf } from '@storybook/react';
import NotificationBar from '../../src/components/common/NotificationBar';

storiesOf('NotificationBar', module)
  .add('default', () => (<NotificationBar notificationMessage="Default notification message" open={true}/>))
  .add('success', () => (<NotificationBar notificationType="success" notificationMessage="Success notification message" open={true}/>))
  .add('warning', () => (<NotificationBar notificationType="warning" notificationMessage="Warning notification message" open={true}/>))
  .add('error', () => (<NotificationBar notificationType="error" notificationMessage="Error notification message" open={true}/>));
