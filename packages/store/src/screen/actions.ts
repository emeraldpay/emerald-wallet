import {ActionTypes, DialogAction, OpenAction} from './types';
import * as addresses from '../addresses'
import {Dispatched} from "../types";

export function gotoScreen(screen: any, item: any = null): OpenAction {
  return {
    type: ActionTypes.OPEN,
    screen,
    item,
  };
}

export function showError(msg: Error) {
  return {
    type: ActionTypes.ERROR,
    error: msg,
  };
}

export function closeError() {
  return {
    type: ActionTypes.ERROR,
    error: null,
  };
}

export function showDialog(name: string, item: any = null): DialogAction {
  return {
    type: ActionTypes.DIALOG,
    value: name,
    item,
  };
}

export function closeDialog(): DialogAction {
  return {
    type: ActionTypes.DIALOG,
    value: null,
    item: null,
  };
}

export function goBack() {
  return {
    type: ActionTypes.GO_BACK,
  };
}

export function catchError(dispatch: any) {
  return (err: any) => {
    dispatch(showError(err));
  };
}

export const openLink = (linkUrl: string) => ({
  type: ActionTypes.OPEN_LINK,
  linkUrl,
});

export function showNotification(message: any, notificationType: any, duration: any, actionText: any, actionToDispatchOnActionClick: any) {
  return {
    type: ActionTypes.NOTIFICATION_SHOW,
    message,
    notificationType,
    duration,
    actionText,
    actionToDispatchOnActionClick,
  };
}

export function dispatchRpcError(dispatch: any) {
  return (err: any) => {
    // console.warn('RPC Error', err && err.message ? err.message : '');
    dispatch(showNotification('Remote server connection failure', 'warning', 2000, null, null));
  };
}

export function closeNotification() {
  return {
    type: ActionTypes.NOTIFICATION_CLOSE,
  };
}

export function goHome(): Dispatched<OpenAction> {
  return (dispatch, getState) => {
    return dispatch(gotoScreen('home'));
  }
}
