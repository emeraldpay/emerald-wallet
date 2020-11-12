import {LedgerApp} from "@emeraldpay/emerald-vault-core";

export interface LedgerState {
  connected: boolean;
  app: "bitcoin" | "bitcoin-testnet" | "ethereum" | "ethereum-classic" | null;
}

export interface IHWKeyState {
  watch: boolean;
  ledger: LedgerState;
}

export enum ActionTypes {
  WATCH = 'HWK/WATCH',
  CHECK_LEDGER = 'HWK/CHECK_LEDGER',
  SET_LEDGER = 'HWK/SET_LEDGER',
}

export interface IWatchAction {
  type: ActionTypes.WATCH;
  value: boolean;
}

export interface ICheckLedger {
  type: ActionTypes.CHECK_LEDGER;
}

export interface ISetLedgerApp {
  type: ActionTypes.SET_LEDGER;
  connected: boolean;
  app: LedgerApp | null;
}

export type IHWKeyAction =
    | IWatchAction
    | ICheckLedger
    | ISetLedgerApp
    ;
