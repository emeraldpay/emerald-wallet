import { BlockchainCode, TokenData } from '@emeraldwallet/core';
import {
  ActionTypes,
  RequestTokenBalanceAction,
  RequestTokensBalancesAction,
  SetTokenBalanceAction,
  TokenBalance,
} from './types';

export function setTokenBalance(
  blockchain: BlockchainCode,
  balance: TokenBalance,
  address: string,
): SetTokenBalanceAction {
  return {
    type: ActionTypes.SET_TOKEN_BALANCE,
    payload: {
      address,
      blockchain,
      balance,
    },
  };
}

export function requestTokenBalance(
  blockchain: BlockchainCode,
  token: TokenData,
  address: string,
): RequestTokenBalanceAction {
  return {
    type: ActionTypes.REQUEST_TOKEN_BALANCE,
    payload: {
      address,
      blockchain,
      token,
    },
  };
}

export function requestTokensBalances(
  blockchain: BlockchainCode,
  tokens: TokenData[],
  address: string,
): RequestTokensBalancesAction {
  return {
    type: ActionTypes.REQUEST_TOKENS_BALANCES,
    payload: {
      address,
      blockchain,
      tokens,
    },
  };
}
