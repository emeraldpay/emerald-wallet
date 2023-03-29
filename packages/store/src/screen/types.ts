export const moduleName = 'screen';

export enum ActionTypes {
  OPEN = 'SCREEN/OPEN',
  ERROR = 'SCREEN/ERROR',
  DIALOG = 'SCREEN/DIALOG',
  GO_BACK = 'SCREEN/GO_BACK',
  GO_HOME = 'SCREEN/GO_HOME',
  OPEN_LINK = 'SCREEN/OPEN_LINK',
  NOTIFICATION_SHOW = 'SCREEN/NOTIFICATION_SHOW',
  NOTIFICATION_CLOSE = 'SCREEN/NOTIFICATION_CLOSE',
}

export enum Dialogs {
  ABOUT = 'about',
  WALLET_SETTINGS = 'wallet-settings',
}

export enum Pages {
  ACCOUNT = 'account',
  ADD_ADDRESS = 'add-address',
  ADD_HD_ADDRESS = 'add-hd-address',
  ADDRESS_BOOK = 'address-book',
  BROADCAST_TX = 'broadcast-tx',
  CREATE_TX = 'create-tx',
  CREATE_TX_BITCOIN = 'create-tx-bitcoin',
  CREATE_TX_CANCEL = 'create-tx-cancel',
  CREATE_TX_CONVERT = 'create-tx-convert',
  CREATE_TX_ETHEREUM = 'create-tx-ethereum',
  CREATE_TX_RECOVER = 'create-tx-recovery',
  CREATE_TX_SPEED_UP = 'create-tx-speed-up',
  CREATE_WALLET = 'create-wallet',
  EDIT_ADDRESS = 'edit-address',
  GLOBAL_KEY = 'global-key',
  HOME = 'home',
  IMPORT_VAULT = 'import-vault',
  PASSWORD_MIGRATION = 'password-migration',
  RECEIVE = 'receive',
  SETTINGS = 'settings',
  SETUP_BLOCKCHAINS = 'setup-blockchains',
  SETUP_VAULT = 'setup-vault',
  SIGN_MESSAGE = 'sign-message',
  SHOW_MESSAGE = 'show-message',
  TX_DETAILS = 'transaction',
  WALLET = 'wallet',
  WALLET_INFO = 'wallet-info',
  WELCOME = 'welcome',
}

export type ScreenState = Partial<
  Record<
    | 'dialog'
    | 'dialogOptions'
    | 'error'
    | 'ignoreOnBack'
    | 'notificationActionText'
    | 'notificationActionToDispatchOnActionClick'
    | 'notificationDuration'
    | 'notificationMessage'
    | 'notificationType'
    | 'restoreData'
    | 'screen'
    | 'screenItem',
    any
  >
>;

export interface IOpenAction {
  type: ActionTypes.OPEN;
  ignore: boolean;
  item: any;
  restore: any;
  screen: string | Pages;
}

export interface IErrorAction {
  type: ActionTypes.ERROR;
  error: Error | null | undefined;
}

export interface IDialogAction {
  type: ActionTypes.DIALOG;
  name: Dialogs | null;
  options?: unknown;
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
