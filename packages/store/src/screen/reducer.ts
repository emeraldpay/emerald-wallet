import {shell} from 'electron';
import {fromJS} from 'immutable';
import {IScreenState, ActionTypes, ScreenAction} from './types';
import * as addresses from "../addresses";

const INITIAL_STATE: IScreenState = {
  screen: null,
  item: null,
  error: null,
  dialog: null,
  dialogItem: null,
};

const initial: any = fromJS(INITIAL_STATE);

const pageHistory: Array<any> = [];
const pushCurrentScreenToHistory = (state: any) => {
  pageHistory.push(
    state
      .set('lastScreen', state.get('screen'))
      .set('lastItem', state.get('item'))
      .set('lastDialog', null).set('dialogItem', null)
  );
};

function onOpen(state: any, action: ScreenAction) {
  if (action.type === ActionTypes.OPEN) {
    pushCurrentScreenToHistory(state);
    return state
      .set('screen', action.screen)
      .set('item', action.item)
      .set('dialog', null).set('dialogItem', null);
  }
  return state;
}

function onError(state: any, action: ScreenAction): any {
  if (action.type === ActionTypes.ERROR) {
    return state.set('error', action.error);
  }
  return state;
}

function onDialog(state: any, action: ScreenAction) {
  if (action.type === ActionTypes.DIALOG) {
    return state
      .set('dialog', action.value)
      .set('dialogItem', action.item);
  }
  return state;
}

function onNotificationOpen(state: any, action: ScreenAction) {
  if (action.type === ActionTypes.NOTIFICATION_SHOW) {
    return state
      .set('notificationMessage', action.message)
      .set('notificationType', action.notificationType)
      .set('notificationDuration', action.duration)
      .set('notificationActionText', action.actionText)
      .set('notificationActionToDispatchOnActionClick', action.actionToDispatchOnActionClick);
  }
  return state;
}

function onNotificationClose(state: any, action: ScreenAction) {
  if (action.type === ActionTypes.NOTIFICATION_CLOSE) {
    return state
      .set('notificationMessage', null)
      .set('notificationDuration', null);
  }
  return state;
}

function onOpenLink(state: any, action: ScreenAction) {
  if (action.type === ActionTypes.OPEN_LINK) {
    shell.openExternal(action.linkUrl);
  }
  return state;
}

function goBack(state: any, action: ScreenAction) {
  if (action.type === ActionTypes.GO_BACK) {
    return pageHistory.pop();
  }
  return state;
}

export function reducer(state: any, action: ScreenAction): any {
  state = state || initial;
  state = onOpen(state, action);
  state = onError(state, action);
  state = onDialog(state, action);
  state = onNotificationOpen(state, action);
  state = onNotificationClose(state, action);
  state = onOpenLink(state, action);
  state = goBack(state, action);
  return state;
}
