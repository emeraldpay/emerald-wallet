import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { accounts, screen } from '../index';
import { IState } from '../types';
import { ActionTypes, IDialogAction, IOpenAction, Pages } from './types';

export function gotoScreen (screen: string | Pages, item: any = null): IOpenAction {
  return {
    type: ActionTypes.OPEN,
    screen,
    item
  };
}

export function showError (msg: Error) {
  return {
    type: ActionTypes.ERROR,
    error: msg
  };
}

export function closeError () {
  return {
    type: ActionTypes.ERROR,
    error: null
  };
}

export function showDialog (name: string, item: any = null): IDialogAction {
  return {
    type: ActionTypes.DIALOG,
    value: name,
    item
  };
}

export function closeDialog (): IDialogAction {
  return {
    type: ActionTypes.DIALOG,
    value: null,
    item: null
  };
}

export function goBack () {
  return {
    type: ActionTypes.GO_BACK
  };
}

export function catchError(dispatch: any): (err: any) => void {
  return (err: any) => {
    dispatch(showError(err));
  };
}

export const openLink = (linkUrl: string) => ({
  type: ActionTypes.OPEN_LINK,
  linkUrl
});

const hashRE = new RegExp('^(0x)?[a-z0-9A-Z]+$');

export function openTxReceipt(hash: string) {
  if (!hashRE.test(hash) || typeof hash != "string") {
    console.warn("Invalid hash provided", hash);
    return openLink('https://receipt.emerald.cash/');
  }
  return openLink(`https://receipt.emerald.cash/tx/${hash}`);
}

export function showNotification(
  message: any, notificationType: any, duration: any, actionText: any, actionToDispatchOnActionClick: any
) {
  return {
    type: ActionTypes.NOTIFICATION_SHOW,
    message,
    notificationType,
    duration,
    actionText,
    actionToDispatchOnActionClick
  };
}

export function dispatchRpcError (dispatch: any) {
  return (err: any) => {
    // console.warn('RPC Error', err && err.message ? err.message : '');
    dispatch(showNotification('Remote server connection failure', 'warning', 2000, null, null));
  };
}

export function closeNotification () {
  return {
    type: ActionTypes.NOTIFICATION_CLOSE
  };
}

export function gotoWalletsScreen() {
  return async (dispatch: any, getState: () => IState) => {
    const state = getState();

    const wallets = accounts.selectors.allWallets(state);

    const hasGlobalKey = await dispatch(accounts.actions.isGlobalKeySet());

    let nextPage = screen.Pages.HOME;
    let walletId: Uuid | undefined;

    if (hasGlobalKey) {
      if (wallets.length === 0) {
        nextPage = screen.Pages.CREATE_WALLET;
      } else if (wallets.length === 1) {
        const [wallet] = wallets;

        nextPage = screen.Pages.WALLET;
        walletId = wallet.id;
      }
    } else {
      const currentScreen = state.screen.get('screen');

      if (currentScreen !== 'welcome') {
        nextPage = screen.Pages.GLOBAL_KEY;
      }
    }

    dispatch(gotoScreen(nextPage, walletId));
  };
}
