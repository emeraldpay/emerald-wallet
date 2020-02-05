import { Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';

export enum AddType {
  GENERATE_PK,
  IMPORT_JSON,
  IMPORT_PRIVATE_KEY,
  SEED_PATH
}

export interface IAddAccountState {
  step: number;
  walletId?: Uuid;
  blockchain?: BlockchainCode;
  type?: AddType;
}

export enum ActionTypes {
  NEXT_PAGE = 'ADD_ACCOUNT_WIZARD/NEXT',
  SET_WALLET = 'ADD_ACCOUNT_WIZARD/SET_WALLET',
  SELECT_BLOCKCHAIN = 'ADD_ACCOUNT_WIZARD/SELECT_BLOCKCHAIN',
  SELECT_TYPE = 'ADD_ACCOUNT_WIZARD/SELECT_TYPE'
}

export interface NextPageAction {
  type: ActionTypes.NEXT_PAGE;
}

export interface ISetWalletAction {
  type: ActionTypes.SET_WALLET;
  value: Uuid;
}

export interface SetBlockchainAction {
  type: ActionTypes.SELECT_BLOCKCHAIN;
  value?: BlockchainCode;
}

export interface SetTypeAction {
  type: ActionTypes.SELECT_TYPE;
  value?: AddType;
}

export type AddAccountAction =
    NextPageAction
  | ISetWalletAction
  | SetBlockchainAction
  | SetTypeAction
  ;
