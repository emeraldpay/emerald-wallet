import { BlockchainCode, TokenData } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { tokenContract, wrapTokenContract } from './erc20';
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

export function createTokenTxData(to: string, amount: BigNumber, isTransfer: boolean): string {
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
