import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { SnackbarCloseReason } from '@material-ui/core';
import { AnyAction } from 'redux';
import { StoredTransaction, accounts } from '../index';
import { Dispatched } from '../types';
import { WrappedError } from '../WrappedError';
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

const hashRegExp = new RegExp('^(0x)?[a-z0-9A-Z]+$');

export function goBack(): IGoBackAction {
  return {
    type: ActionTypes.GO_BACK,
  };
}

export function gotoScreen(
  screen: string | Pages,
  item: unknown = null,
  restore: unknown = null,
  ignore = false,
): IOpenAction {
  return {
    type: ActionTypes.OPEN,
    ignore,
    item,
    restore,
    screen,
  };
}

export function gotoWalletsScreen(): Dispatched {
  return async (dispatch, getState) => {
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

export function showError(error: Error | string, transaction?: StoredTransaction): IErrorAction {
  return {
    type: ActionTypes.ERROR,
    error: new WrappedError(error, transaction),
  };
}

export function closeError(): IErrorAction {
  return {
    type: ActionTypes.ERROR,
    error: null,
  };
}

export function showNotification(
  message: string,
  messageType?: 'info' | 'success' | 'warning' | 'error',
  duration?: number,
  buttonText?: string,
  onButtonClick?: AnyAction,
): IShowNotificationAction {
  return {
    type: ActionTypes.NOTIFICATION_SHOW,
    duration,
    message,
    messageType,
    buttonText,
    onButtonClick,
  };
}

export function closeNotification(reason: SnackbarCloseReason | 'manual'): ICloseNotificationAction {
  return {
    type: ActionTypes.NOTIFICATION_CLOSE,
    reason,
  };
}
