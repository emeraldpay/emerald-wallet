import { BlockchainCode, TokenData } from '@emeraldwallet/core';

export const moduleName = 'tokens';

export interface TokenBalance {
  symbol: string;
  tokenId: string;
  decimals: number;
  unitsValue: string;
}

export type TokensState = {
  [blockchain in BlockchainCode]?: {
    [address: string]: {
      [tokenId: string]: TokenBalance;
    };
  };
};

export enum ActionTypes {
  SET_TOKEN_BALANCE = 'TOKENS/SET_TOKEN_BALANCE',
  REQUEST_TOKEN_BALANCE = 'TOKENS/REQUEST_TOKEN_BALANCE',
  REQUEST_TOKENS_BALANCES = 'TOKENS/REQUEST_TOKENS_BALANCES',
}

export interface SetTokenBalanceAction {
  type: ActionTypes.SET_TOKEN_BALANCE;
  payload: {
    address: string;
    blockchain: BlockchainCode;
    balance: TokenBalance;
  };
}

export interface RequestTokenBalanceAction {
  type: ActionTypes.REQUEST_TOKEN_BALANCE;
  payload: {
    address: string;
    blockchain: BlockchainCode;
    token: TokenData;
  };
}

export interface RequestTokensBalancesAction {
  type: ActionTypes.REQUEST_TOKENS_BALANCES;
  payload: {
    address: string;
    blockchain: BlockchainCode;
    tokens: TokenData[];
  };
}

export type TokensAction = SetTokenBalanceAction | RequestTokenBalanceAction | RequestTokensBalancesAction;
