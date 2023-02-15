import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import {
  ActionTypes,
  Dialogs,
  ICloseNotificationAction,
  IDialogAction,
  IErrorAction,
  IGoBackAction,
  IOpenAction,
  IOpenLinkAction,
  IShowNotificationAction,
  Pages,
} from './types';
import { accounts } from '../index';
import { IState } from '../types';

const hashRegExp = new RegExp('^(0x)?[a-z0-9A-Z]+$');

export function gotoScreen(screen: string | Pages, item: any = null, restore: any = null, ignore = false): IOpenAction {
  return {
    type: ActionTypes.OPEN,
    ignore,
    item,
    restore,
    screen,
  };
}

export function gotoWalletsScreen() {
  return async (dispatch: any, getState: () => IState) => {
    const state = getState();

    const isLoading = accounts.selectors.isLoading(state);

    if (isLoading) {
      dispatch(gotoScreen(Pages.WELCOME));
    } else {
      const wallets = accounts.selectors.allWallets(state);

      const hasGlobalKey = await dispatch(accounts.actions.isGlobalKeySet());

      let nextPage = Pages.HOME;
      let walletId: Uuid | undefined;

      if (hasGlobalKey) {
        if (wallets.length === 0) {
          nextPage = Pages.CREATE_WALLET;
        } else if (wallets.length === 1) {
          const [wallet] = wallets;

          nextPage = Pages.WALLET;
          walletId = wallet.id;
        }
      } else {
        nextPage = Pages.SETUP_VAULT;
      }

      dispatch(gotoScreen(nextPage, walletId));
    }
  };
}

export function goBack(): IGoBackAction {
  return {
    type: ActionTypes.GO_BACK,
  };
}

export function showNotification(
  message: any,
  notificationType: any,
  duration: any,
  actionText: any,
  actionToDispatchOnActionClick: any,
): IShowNotificationAction {
  return {
    type: ActionTypes.NOTIFICATION_SHOW,
    message,
    notificationType,
    duration,
    actionText,
    actionToDispatchOnActionClick,
  };
}

export function closeNotification(): ICloseNotificationAction {
  return {
    type: ActionTypes.NOTIFICATION_CLOSE,
  };
}

export function openLink(linkUrl: string): IOpenLinkAction {
  return {
    type: ActionTypes.OPEN_LINK,
    linkUrl,
  };
}

export function openTxReceipt(hash: string): IOpenLinkAction {
  if (!hashRegExp.test(hash)) {
    console.warn('Invalid hash provided', hash);

    return openLink('https://receipt.emerald.cash/');
  }

  return openLink(`https://receipt.emerald.cash/tx/${hash}`);
}

export function showDialog(name: Dialogs, options?: unknown): IDialogAction {
  return {
    type: ActionTypes.DIALOG,
    name,
    options,
  };
}

export function closeDialog(): IDialogAction {
  return {
    type: ActionTypes.DIALOG,
    name: null,
  };
}

export function showError(error: Error): IErrorAction {
  return {
    type: ActionTypes.ERROR,
    error,
  };
}

export function closeError(): IErrorAction {
  return {
    type: ActionTypes.ERROR,
    error: null,
  };
}

export function dispatchRpcError(dispatch: any) {
  return () => {
    dispatch(showNotification('Remote server connection failure', 'warning', 2000, null, null));
  };
}

export function catchError(dispatch: any): (err: Error) => void {
  return (err: Error) => {
    dispatch(showError(err));
  };
}
