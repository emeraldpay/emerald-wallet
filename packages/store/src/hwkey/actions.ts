import { LedgerApp } from '@emeraldpay/emerald-vault-core';
import { ActionTypes, ICheckLedger, ISetLedgerApp, IWatchAction } from './types';

export function setWatch(value: boolean): IWatchAction {
  return {
    type: ActionTypes.WATCH,
    value,
  };
}

export function setLedger(connected: boolean, app: LedgerApp | null): ISetLedgerApp {
  return {
    type: ActionTypes.SET_LEDGER,
    app,
    connected,
  };
}

export function checkLedger(): ICheckLedger {
  return {
    type: ActionTypes.CHECK_LEDGER,
  };
}
