import { shell } from 'electron';
import {
  ActionTypes,
  IDialogAction,
  IErrorAction,
  IOpenAction,
  IOpenLinkAction,
  IShowNotificationAction,
  ScreenAction,
  ScreenState,
} from './types';

const INITIAL_STATE: ScreenState = {};

const history: ScreenState[] = [];

function onError(state: ScreenState, action: IErrorAction): ScreenState {
  return { ...state, error: action.error };
}

function onDialog(state: ScreenState, action: IDialogAction): ScreenState {
  return { ...state, dialog: action.value };
}

function goBack(state: ScreenState): ScreenState {
  let prev = history.pop();

  if (prev == null) {
    return state;
  }

  while (prev?.ignoreOnBack === true || prev?.screen === state.screen) {
    prev = history.pop();
  }

  return prev ?? state;
}

function onNotificationOpen(state: ScreenState, action: IShowNotificationAction): ScreenState {
  return {
    ...state,
    notificationActionText: action.actionText,
    notificationActionToDispatchOnActionClick: action.actionToDispatchOnActionClick,
    notificationDuration: action.duration,
    notificationMessage: action.message,
    notificationType: action.notificationType,
  };
}

function onNotificationClose(state: ScreenState): ScreenState {
  return { ...state, notificationMessage: null, notificationDuration: null };
}

function onOpen(state: ScreenState, action: IOpenAction): ScreenState {
  history.push({
    ...state,
    restoreData: action.restore,
  });

  return {
    ...state,
    dialog: null,
    ignoreOnBack: action.ignore,
    screen: action.screen,
    screenItem: action.item,
    restoreData: null,
  };
}

function onOpenLink(state: ScreenState, action: IOpenLinkAction): ScreenState {
  (async () => {
    await shell.openExternal(action.linkUrl);
  })();

  return state;
}

export function reducer(state = INITIAL_STATE, action: ScreenAction): ScreenState {
  switch (action.type) {
    case ActionTypes.ERROR:
      return onError(state, action);
    case ActionTypes.DIALOG:
      return onDialog(state, action);
    case ActionTypes.GO_BACK:
      return goBack(state);
    case ActionTypes.NOTIFICATION_SHOW:
      return onNotificationOpen(state, action);
    case ActionTypes.NOTIFICATION_CLOSE:
      return onNotificationClose(state);
    case ActionTypes.OPEN:
      return onOpen(state, action);
    case ActionTypes.OPEN_LINK:
      return onOpenLink(state, action);
    default:
      return state;
  }
}
