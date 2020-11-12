import {IHWKeyState} from "./types";
import {LedgerApp} from "@emeraldpay/emerald-vault-core";
import {IState} from "../types";
import {BlockchainCode, ledgerByBlockchain} from "@emeraldwallet/core";

export function isWatching(state: IHWKeyState): boolean {
  return state.watch
}

export function getLedgerApp(state: IHWKeyState): LedgerApp | null {
  return state.ledger.app
}

export function isBlockchainOpen(state: IState, blockchain: BlockchainCode): boolean {
  if (state.hwkey.ledger.connected && state.hwkey.ledger.app) {
    const current = ledgerByBlockchain[state.hwkey.ledger.app];
    return current === blockchain;
  }
  return false;
}