import { BlockchainCode, Wallet } from '@emeraldwallet/core';
import { ActionTypes, AddType, NextPageAction, SetBlockchainAction, SetTypeAction, ISetWalletAction } from './types';

export function nextPage (): NextPageAction {
  return {
    type: ActionTypes.NEXT_PAGE
  };
}

export function start (wallet: Wallet): ISetWalletAction {
  return {
    type: ActionTypes.SET_WALLET,
    value: wallet.id
  };
}

export function setBlockchain (code?: BlockchainCode): SetBlockchainAction {
  return {
    type: ActionTypes.SELECT_BLOCKCHAIN,
    value: code
  };
}

export function setType (type?: AddType): SetTypeAction {
  return {
    type: ActionTypes.SELECT_TYPE,
    value: type
  };
}
