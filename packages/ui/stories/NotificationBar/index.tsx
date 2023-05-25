import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Notification from '../../src/components/common/Notification';

storiesOf('Notification', module)
  .add('default', () => (
    <Notification
      notificationMessage="Default notification message"
      open={true}
      onButtonClick={action('action')}
      onClose={action('close')}
    />
  ))
  .add('success', () => (
    <Notification
      notificationMessage="Success notification message"
      notificationMessageType="success"
      open={true}
      onButtonClick={action('action')}
      onClose={action('close')}
    />
  ))
  .add('warning', () => (
    <Notification
      notificationMessage="Warning notification message"
      notificationMessageType="warning"
      open={true}
      onButtonClick={action('action')}
      onClose={action('close')}
    />
  ))
  .add('error', () => (
    <Notification
      notificationMessage="Error notification message"
      notificationMessageType="error"
      open={true}
      onButtonClick={action('action')}
      onClose={action('close')}
    />
  ));
