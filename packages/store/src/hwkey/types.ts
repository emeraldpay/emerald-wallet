import { LedgerApp } from '@emeraldpay/emerald-vault-core';

export interface LedgerState {
  app: 'bitcoin' | 'bitcoin-testnet' | 'ethereum' | 'ethereum-classic' | null;
  connected: boolean;
}

export interface HWKeyState {
  ledger: LedgerState;
  watch: boolean;
}

export enum ActionTypes {
  CHECK_LEDGER = 'HWK/CHECK_LEDGER',
  SET_LEDGER = 'HWK/SET_LEDGER',
  WATCH = 'HWK/WATCH',
}

export interface CheckLedger {
  type: ActionTypes.CHECK_LEDGER;
}

export interface SetLedgerApp {
  type: ActionTypes.SET_LEDGER;
  app: LedgerApp | null;
  connected: boolean;
}

export interface WatchAction {
  type: ActionTypes.WATCH;
  value: boolean;
}

export type IHWKeyAction = CheckLedger | SetLedgerApp | WatchAction;
