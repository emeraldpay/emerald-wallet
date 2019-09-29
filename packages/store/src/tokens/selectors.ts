import { BlockchainCode } from '@emeraldwallet/core';
import { ITokenBalance, ITokensState, moduleName } from './types';

export function selectBalances (state: any, address: string, chain: BlockchainCode): any | null {
  const balances = state[moduleName] as ITokensState;
  if (balances[chain]) {
    const b = balances[chain];
    if (b && b[address]) {
      return Object.values(b[address]);
    }
  }
  return null;
}

export function selectBalance(state: any, tokenId: string, address: string, chain: BlockchainCode): any | null {
  const balances = state[moduleName] as ITokensState;
  if (balances[chain]) {
    const b = balances[chain];
    if (b && b[address]) {
      return b[address][tokenId];
    }
  }
  return null;
}
