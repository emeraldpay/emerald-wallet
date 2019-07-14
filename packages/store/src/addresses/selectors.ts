import { moduleName } from "./types";
import {List} from "immutable";
import {Wei} from "@emeraldplatform/eth";

export function all(state: any) {
  return state[moduleName].get('addresses');
}

export const isLoading = (state: any): boolean => state[moduleName].get('loading');

export const find = (state: any, address: string, chain: string) => {
  if (!address) {
    return null;
  }
  return all(state).find(
    (a: any) => a.get('id') === address.toLowerCase() && a.get('blockchain') === chain);
};

export const selectTotalBalance = (chain: any, state: any) => state.addresses.get('addresses', List())
  .filter((account: any) => account.get('blockchain') === chain.toLowerCase())
  .map((account: any) => (account.get('balance') ? account.get('balance') : Wei.ZERO))
  .reduce((t:any, v:any) => t.plus(v), Wei.ZERO);
