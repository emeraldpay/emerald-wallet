import { BlockchainCode } from '@emeraldwallet/core';
import { ITokenInfo } from "@emeraldwallet/erc20";
import BigNumber from 'bignumber.js';
import { tokenContract, wrapTokenContract } from './erc20';
import {
  ActionTypes,
  IRequestTokenBalanceAction,
  IRequestTokensBalancesAction,
  ISetTokenBalanceAction,
  ITokenBalance,
} from './types';

export function setTokenBalance (chain: any, tokenBalance: ITokenBalance, address: string): ISetTokenBalanceAction {
  return {
    type: ActionTypes.SET_TOKEN_BALANCE,
    payload: {
      chain,
      address,
      balance: tokenBalance
    }
  };
}

export function requestTokenBalance (chain: any, token: any, address: string): IRequestTokenBalanceAction {
  return {
    type: ActionTypes.REQUEST_TOKEN_BALANCE,
    payload: {
      chain,
      token,
      address
    }
  };
}

export function requestTokensBalances(
  chain: BlockchainCode, tokens: ITokenInfo[], address: string
): IRequestTokensBalancesAction {
  return {
    type: ActionTypes.REQUEST_TOKENS_BALANCES,
    payload: {
      chain,
      tokens,
      address
    }
  };
}

export function createTokenTxData (to: string, amount: any, isTransfer: boolean): string {
  const value = amount.toString(10);
  if (isTransfer) {
    return tokenContract.functionToData('transfer', { _to: to, _value: value });
  }
  return tokenContract.functionToData('approve', { _spender: to, _amount: value });
}

export function createWrapTxData(): string {
  return wrapTokenContract.functionToData('deposit', {});
}

export function createUnwrapTxData(amount: BigNumber): string {
  return wrapTokenContract.functionToData('withdraw', { _value: amount.toString(10) });
}
