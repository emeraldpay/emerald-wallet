import { action } from '@storybook/addon-actions';
import {Meta} from '@storybook/react';
import * as React from 'react';
import Notification from '../../src/components/common/Notification';

export default {
  title: 'Notification',
  component: Notification,
} as Meta

export const Default = {
  args: {
    open: true,
    notificationMessage: "Default notification message",
    onButtonClick: action('onButtonClick'),
    onClose: action('onClose')
  }
};

export const Success = {
  args: {
    open: true,
    notificationMessage: "Success notification message",
    notificationMessageType: "success",
    onButtonClick: action('onButtonClick'),
    onClose: action('onClose')
  }
};

export const Warning = {
  args: {
    open: true,
    notificationMessage: "Warning notification message",
    notificationMessageType: "warning",
    onButtonClick: action('onButtonClick'),
    onClose: action('onClose')
  }
};

export const Error = {
  args: {
    open: true,
    notificationMessage: "Error notification message",
    notificationMessageType: "error",
    onButtonClick: action('onButtonClick'),
    onClose: action('onClose')
  }
};
