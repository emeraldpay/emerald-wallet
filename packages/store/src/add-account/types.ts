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
  START = 'ADD_ACCOUNT_WIZARD/START',
  SELECT_BLOCKCHAIN = 'ADD_ACCOUNT_WIZARD/SELECT_BLOCKCHAIN',
  SELECT_TYPE = 'ADD_ACCOUNT_WIZARD/SELECT_TYPE'
}

export interface INextPageAction {
  type: ActionTypes.NEXT_PAGE;
}

export interface IStartImportAction {
  type: ActionTypes.START;
}

export interface ISetBlockchainAction {
  type: ActionTypes.SELECT_BLOCKCHAIN;
  value?: BlockchainCode;
}

export interface ISetTypeAction {
  type: ActionTypes.SELECT_TYPE;
  value?: AddType;
}

export type AddAccountAction =
    INextPageAction
  | IStartImportAction
  | ISetBlockchainAction
  | ISetTypeAction
  ;
