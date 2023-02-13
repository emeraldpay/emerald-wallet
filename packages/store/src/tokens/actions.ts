import { BlockchainCode, PersistentState, TokenData } from '@emeraldwallet/core';
import {
  ActionTypes,
  InitTokenStateAction,
  RequestTokenBalanceAction,
  RequestTokensBalancesAction,
  SetTokenBalanceAction,
  TokenBalance,
} from './types';
import { Dispatched } from '../types';

export function initState(balances: PersistentState.Balance[]): Dispatched<void, InitTokenStateAction> {
  return (dispatch, getState) => {
    const {
      application: { tokens },
    } = getState();

    dispatch({
      type: ActionTypes.INIT_STATE,
      balances,
      tokens,
    });
  };
}

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
