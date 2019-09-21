import { BlockchainCode } from '@emeraldwallet/core';
import { ITokenBalance, ITokensState, moduleName } from './types';

export function selectBalances (state: any, address: string, chain: BlockchainCode): any | null {
  const balances = state[moduleName] as ITokensState;
  if (balances[chain]) {
    const b = balances[chain];
    if (b) {
      return Object.values(b[address]);
    }
  }
  return null;
}
