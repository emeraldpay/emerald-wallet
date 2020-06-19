import {IAddressState, isEqualSeed} from "./types";
import {IState} from "../types";
import {HDPath} from "@emeraldwallet/core";
import {SeedReference} from "@emeraldpay/emerald-vault-core";

export function getByAccount(state: IState, seed: SeedReference, account: number): IAddressState[] {
  if (!state.hdpathPreview) {
    return [];
  }
  if (!state.hdpathPreview.accounts) {
    return [];
  }
  return state.hdpathPreview.accounts.filter((acc) =>
    isEqualSeed(seed, acc.seed) && HDPath.parse(acc.hdpath).account == account
  )
}

export function getCurrentDisplay(state: IState, seed: SeedReference): IAddressState[] {
  if (!state.hdpathPreview) {
    return [];
  }
  return getByAccount(state, seed, state.hdpathPreview.display.account);
}