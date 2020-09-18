import {AnyTokenCode, BlockchainCode} from '@emeraldwallet/core';

export const moduleName = 'tokens';

export interface ITokenBalance {
    symbol: AnyTokenCode;
    tokenId: string;
    decimals: number;
    unitsValue: string;
}

export type ITokensState = {
  [chain in BlockchainCode]?: {
    [address: string]: {
      [tokenId: string]: ITokenBalance
    };
  };
};

export enum ActionTypes {
  SET_TOKEN_BALANCE = 'TOKENS/SET_TOKEN_BALANCE',
  REQUEST_TOKEN_BALANCE = 'TOKENS/REQUEST_TOKEN_BALANCE',
  REQUEST_TOKENS_BALANCES = 'TOKENS/REQUEST_TOKENS_BALANCES'
  // SET_TOKENS_BALANCES: 'TOKEN/SET_TOKENS_BALANCES',
  // RESET_BALANCES: 'TOKEN/RESET_BALANCES',
  // RESET: 'TOKEN/RESET',
  // SET_INFO: 'TOKEN/SET_INFO',
  // SET_LIST: 'TOKEN/SET_LIST',
  // LOADING: 'TOKEN/LOADING',
}

export interface ISetTokenBalanceAction {
  type: ActionTypes.SET_TOKEN_BALANCE;
  payload: any;
}

export interface IRequestTokenBalanceAction {
  type: ActionTypes.REQUEST_TOKEN_BALANCE;
  payload: any;
}

export interface IRequestTokensBalancesAction {
  type: ActionTypes.REQUEST_TOKENS_BALANCES;
  payload: {
    chain: BlockchainCode;
    tokens: any[];
    address: string;
  };
}

export type TokensAction =
  ISetTokenBalanceAction |
  IRequestTokenBalanceAction |
  IRequestTokensBalancesAction;
