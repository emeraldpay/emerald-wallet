import {shell} from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import Immutable from 'immutable';

const initial = Immutable.fromJS({
  screen: null,
  item: null,
  error: null,
  dialog: null,
  dialogItem: null,
});

function onOpen(state, action) {
  if (action.type === 'SCREEN/OPEN') {
    return state
      .set('screen', action.screen)
      .set('item', action.item)
      .set('dialog', null).set('dialogItem', null);
  }
  return state;
}

function onError(state, action) {
  if (action.type === 'SCREEN/ERROR') {
    return state
      .set('error', action.message)
      .set('dialog', null).set('dialogItem', null);
  }
  return state;
}

function onDialog(state, action) {
  if (action.type === 'SCREEN/DIALOG') {
    return state
      .set('dialog', action.value)
      .set('dialogItem', action.item);
  }
  return state;
}

function onNotificationOpen(state, action) {
  if (action.type === 'SCREEN/NOTIFICATION_SHOW') {
    return state
      .set('notificationMessage', action.message)
      .set('notificationType', action.notificationType)
      .set('notificationDuration', action.duration)
      .set('notificationActionText', action.actionText)
      .set('notificationActionToDispatchOnActionClick', action.actionToDispatchOnActionClick);
  }
  return state;
}

function onNotificationClose(state, action) {
  if (action.type === 'SCREEN/NOTIFICATION_CLOSE') {
    return state
      .set('notificationMessage', null)
      .set('notificationDuration', null);
  }
  return state;
}

function onOpenLink(state, {type, linkUrl}) {
  if (type === 'SCREEN/OPEN_LINK') {
    shell.openExternal(linkUrl);
  }
  return state;
}

export default function screenReducers(state, action) {
  state = state || initial;
  state = onOpen(state, action);
  state = onError(state, action);
  state = onDialog(state, action);
  state = onNotificationOpen(state, action);
  state = onNotificationClose(state, action);
  state = onOpenLink(state, action);
  return state;
}
