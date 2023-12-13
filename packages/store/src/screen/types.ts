import { SnackbarCloseReason } from '@material-ui/core';
import { AnyAction } from 'redux';

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
  CREATE_TX_RECOVER = 'create-tx-recovery',
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

export type ScreenState = {
  dialog?: Dialogs | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dialogOptions?: any;
  error?: Error | null;
  ignoreOnBack?: boolean;
  notificationMessage?: string;
  notificationMessageType?: 'info' | 'success' | 'warning' | 'error';
  notificationDuration?: number | null;
  notificationButtonText?: string;
  notificationOnButtonClick?: AnyAction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restoreData?: any;
  screen?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  screenItem?: any;
};

export interface IOpenAction {
  type: ActionTypes.OPEN;
  ignore: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  message: string;
  messageType?: 'info' | 'success' | 'warning' | 'error';
  duration?: number | null;
  buttonText?: string;
  onButtonClick?: AnyAction;
}

export interface ICloseNotificationAction {
  type: ActionTypes.NOTIFICATION_CLOSE;
  reason: SnackbarCloseReason | 'manual';
}

export interface IGoBackAction {
  type: ActionTypes.GO_BACK;
}

export interface IOpenLinkAction {
  type: ActionTypes.OPEN_LINK;
  linkUrl: string;
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
