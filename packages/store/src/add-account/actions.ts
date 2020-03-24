import { BlockchainCode } from '@emeraldwallet/core';
import { ActionTypes, AddType, INextPageAction, ISetBlockchainAction, ISetTypeAction, ISetWalletAction } from './types';

export function nextPage (): INextPageAction {
  return {
    type: ActionTypes.NEXT_PAGE
  };
}

export function start (walletId: string): ISetWalletAction {
  return {
    type: ActionTypes.START,
    value: walletId
  };
}

export function setBlockchain (code?: BlockchainCode): ISetBlockchainAction {
  return {
    type: ActionTypes.SELECT_BLOCKCHAIN,
    value: code
  };
}

export function setType (type?: AddType): ISetTypeAction {
  return {
    type: ActionTypes.SELECT_TYPE,
    value: type
  };
}
