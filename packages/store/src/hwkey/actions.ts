import {Dispatched, IState} from '../types';
import {ActionTypes, ICheckLedger, IHWKeyAction, ISetLedgerApp, IWatchAction} from './types';
import {LedgerApp} from "@emeraldpay/emerald-vault-core";
import {isWatching} from './selectors';

export function setWatch(value: boolean): IWatchAction {
  return {
    type: ActionTypes.WATCH,
    value
  };
}

export function setLedger(connected: boolean, app: LedgerApp | null): ISetLedgerApp {
  return {
    type: ActionTypes.SET_LEDGER,
    connected,
    app
  }
}

export function checkLedger(): ICheckLedger {
  return {
    type: ActionTypes.CHECK_LEDGER
  }
}