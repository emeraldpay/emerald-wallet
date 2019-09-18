import {ITokenBalance, ITokensState, moduleName} from "./types";
import {BlockchainCode} from "@emeraldwallet/core";

export function selectBalances(state: any, address: string, chain: BlockchainCode): Array<ITokenBalance> | null {
  const balances = state[moduleName] as ITokensState;
  if (balances[chain]) {
    const b = balances[chain];
    if (b) {
      return b[address];
    }
  }
  return null;
}
