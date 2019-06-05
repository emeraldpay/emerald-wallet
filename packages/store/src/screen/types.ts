export enum ActionTypes {
  OPEN = 'SCREEN/OPEN',
  ERROR = 'SCREEN/ERROR',
  DIALOG = 'SCREEN/DIALOG',
  GO_BACK = 'SCREEN/GO_BACK',
  OPEN_LINK = 'SCREEN/OPEN_LINK',
  NOTIFICATION_SHOW = 'SCREEN/NOTIFICATION_SHOW',
  NOTIFICATION_CLOSE = 'SCREEN/NOTIFICATION_CLOSE',
}

export interface IScreenState {
  screen: any | null;
  item: any | null;
  error: any | null;
  dialog: any | null;
  dialogItem: any | null;
}

export interface OpenAction {
  type: ActionTypes.OPEN;
  screen: string;
  item: any;
}

export interface ErrorAction {
  type: ActionTypes.ERROR;
  error: any;
}

export interface DialogAction {
  type: ActionTypes.DIALOG;
  value: any;
  item: any;
}

export interface ShowNotificationAction {
  type: ActionTypes.NOTIFICATION_SHOW;
  message: any;
  actionToDispatchOnActionClick: any;
  notificationType: any;
  duration: any;
  actionText: any;
}

export interface CloseNotificationAction {
  type: ActionTypes.NOTIFICATION_CLOSE;
}

export interface GoBackAction {
  type: ActionTypes.GO_BACK;
}

export interface OpenLinkAction {
  type: ActionTypes.OPEN_LINK;
  linkUrl: any;
}

export type ScreenAction =
  | OpenAction
  | ErrorAction
  | DialogAction
  | GoBackAction
  | OpenLinkAction
  | ShowNotificationAction
  | CloseNotificationAction;
