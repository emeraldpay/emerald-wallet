import { LedgerApp } from '@emeraldpay/emerald-vault-core';
import { ActionTypes, CheckLedger, SetLedgerApp, WatchAction } from './types';

export function checkLedger(): CheckLedger {
  return {
    type: ActionTypes.CHECK_LEDGER,
  };
}

export function setLedger(connected: boolean, app: LedgerApp | null): SetLedgerApp {
  return {
    type: ActionTypes.SET_LEDGER,
    app,
    connected,
  };
}

export function setWatch(value: boolean): WatchAction {
  return {
    type: ActionTypes.WATCH,
    value,
  };
}
