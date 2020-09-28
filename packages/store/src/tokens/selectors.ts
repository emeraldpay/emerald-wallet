import {BlockchainCode, tokenAmount} from '@emeraldwallet/core';
import {IState} from '../types';
import {ITokenBalance, ITokensState, moduleName} from './types';
import {BigAmount} from "@emeraldpay/bigamount";
import {registry} from "@emeraldwallet/erc20";

export function selectBalances(state: IState, address: string, chain: BlockchainCode): BigAmount[] | undefined {
  const balances = state[moduleName] as ITokensState;
  if (balances[chain]) {
    const b = balances[chain];
    if (b && b[address]) {
      const values: ITokenBalance[] = Object.values(b[address]);
      return values.map((token) => tokenAmount(token.unitsValue, token.symbol))
    }
  }
  return undefined;
}

export function selectBalance(
  state: IState, tokenId: string, address: string, chain: BlockchainCode
): BigAmount | undefined {
  const balances = state[moduleName] as ITokensState;
  if (balances && balances[chain]) {
    const b = balances[chain];
    if (b && b[address]) {
      const token = b[address][tokenId];
      if (typeof token == "object") {
        return tokenAmount(token.unitsValue, token.symbol)
      }
    }
  }
  return undefined;
}
