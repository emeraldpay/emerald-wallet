export const moduleName = 'screen';

export enum ActionTypes {
  OPEN = 'SCREEN/OPEN',
  ERROR = 'SCREEN/ERROR',
  DIALOG = 'SCREEN/DIALOG',
  GO_BACK = 'SCREEN/GO_BACK',
  GO_HOME = 'SCREEN/GO_HOME',
  OPEN_LINK = 'SCREEN/OPEN_LINK',
  NOTIFICATION_SHOW = 'SCREEN/NOTIFICATION_SHOW',
  NOTIFICATION_CLOSE = 'SCREEN/NOTIFICATION_CLOSE'
}

export enum Pages {
  WALLET = 'wallet',
  ACCOUNT = 'account',
  HOME = 'home',
  ADDRESS_BOOK = 'address-book',
  TX_DETAILS = 'transaction',
  CREATE_TX = 'create-tx',
  CREATE_TX_ETHEREUM = 'create-tx-ethereum',
  CREATE_TX_BITCOIN = 'create-tx-bitcoin',
  CREATE_WALLET = 'create-wallet',
  //@deprecated, rename to setup coins
  CREATE_HD_ACCOUNT = 'create-hd-account',
  BROADCAST_TX = 'broadcast-tx',
  RECEIVE = 'receive',
}

export interface IScreenState {
  screen: any | null;
  item: any | null;
  error: any | null;
  dialog: any | null;
  dialogItem: any | null;
}

export interface IOpenAction {
  type: ActionTypes.OPEN;
  screen: string | Pages;
  item: any;
}

export interface IErrorAction {
  type: ActionTypes.ERROR;
  error: any;
}

export interface IDialogAction {
  type: ActionTypes.DIALOG;
  value: any;
  item: any;
}

export interface IShowNotificationAction {
  type: ActionTypes.NOTIFICATION_SHOW;
  message: any;
  actionToDispatchOnActionClick: any;
  notificationType: any;
  duration: any;
  actionText: any;
}

export interface ICloseNotificationAction {
  type: ActionTypes.NOTIFICATION_CLOSE;
}

export interface IGoBackAction {
  type: ActionTypes.GO_BACK;
}

export interface IOpenLinkAction {
  type: ActionTypes.OPEN_LINK;
  linkUrl: any;
}

export interface IGoHomeAction {
  type: ActionTypes.GO_HOME;
}

export type ScreenAction =
  | IOpenAction
  | IErrorAction
  | IDialogAction
  | IGoBackAction
  | IOpenLinkAction
  | IShowNotificationAction
  | ICloseNotificationAction
  | IGoHomeAction;
