import {IHWKeyState} from "./types";
import {LedgerApp} from "@emeraldpay/emerald-vault-core";

export function isWatching(state: IHWKeyState): boolean {
  return state.watch
}

export function getLedgerApp(state: IHWKeyState): LedgerApp | null {
  return state.ledger.app
}