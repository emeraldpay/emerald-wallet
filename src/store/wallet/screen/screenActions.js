// @flow
import createLogger from '../../../utils/logger';

const log = createLogger('screenActions');

export function gotoScreen(screen, item = null) {
  return {
    type: 'SCREEN/OPEN',
    screen,
    item,
  };
}

export function showError(msg: Error) {
  log.error('Show error', msg);

  return {
    type: 'SCREEN/ERROR',
    error: msg,
  };
}

export function closeError() {
  return {
    type: 'SCREEN/ERROR',
    error: null,
  };
}

export function showDialog(name, item = null) {
  return {
    type: 'SCREEN/DIALOG',
    value: name,
    item,
  };
}

export function closeDialog() {
  return {
    type: 'SCREEN/DIALOG',
    value: null,
    item: null,
  };
}

export function goBack() {
  return {
    type: 'SCREEN/GO_BACK',
  };
}

export function catchError(dispatch) {
  return (err) => {
    dispatch(showError(err));
  };
}

export const openLink = (linkUrl) => ({
  type: 'SCREEN/OPEN_LINK',
  linkUrl,
});

export function showNotification(message, notificationType, duration, actionText, actionToDispatchOnActionClick) {
  return {
    type: 'SCREEN/NOTIFICATION_SHOW',
    message,
    notificationType,
    duration,
    actionText,
    actionToDispatchOnActionClick,
  };
}

export function closeNotification() {
  return {
    type: 'SCREEN/NOTIFICATION_CLOSE',
  };
}
