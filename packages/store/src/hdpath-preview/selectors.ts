import {IAddressState, isEqualSeed, SourceSeed} from "./types";
import {IState} from "../types";
import {HDPath} from "@emeraldwallet/core";

export function getByAccount(state: IState, seed: SourceSeed, account: number): IAddressState[] {
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

export function getCurrentDisplay(state: IState, seed: SourceSeed): IAddressState[] {
  if (!state.hdpathPreview) {
    return [];
  }
  return getByAccount(state, seed, state.hdpathPreview.display.account);
}