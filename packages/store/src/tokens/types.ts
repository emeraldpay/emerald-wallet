import { BlockchainCode, PersistentState, TokenData } from '@emeraldwallet/core';

export const moduleName = 'tokens';

export enum TokenBalanceBelong {
  ANY,
  OWN,
  ALLOWED,
}

export interface TokenBalanceFilter {
  belonging?: TokenBalanceBelong;
  belongsTo?: string;
}

export interface TokenBalance {
  decimals: number;
  symbol: string;
  unitsValue: string;
}

interface AddressBalance {
  [contractAddress: string]: TokenBalance | undefined;
}

export type TokensState = {
  balances: {
    [blockchain in BlockchainCode]?: {
      [address: string]: AddressBalance | undefined;
    };
  };
  initialized: boolean;
};

export enum ActionTypes {
  INIT_STATE = 'TOKEN/INIT_STATE',
  SET_TOKEN_BALANCE = 'TOKENS/SET_TOKEN_BALANCE',
}

export interface InitTokenStateAction {
  type: ActionTypes.INIT_STATE;
  payload: {
    balances: PersistentState.Balance[];
    tokens: TokenData[];
  };
}

export interface SetTokenBalanceAction {
  type: ActionTypes.SET_TOKEN_BALANCE;
  payload: {
    address: string;
    blockchain: BlockchainCode;
    balance: TokenBalance;
    contractAddress: string;
  }[];
}

export type TokensAction = InitTokenStateAction | SetTokenBalanceAction;
