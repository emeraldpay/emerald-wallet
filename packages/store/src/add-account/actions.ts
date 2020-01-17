import { Wallet, WalletOp } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { ActionTypes, AddType, NextPageAction, SetBlockchainAction, SetTypeAction, SetWalletAction } from './types';

export function nextPage (): NextPageAction {
  return {
    type: ActionTypes.NEXT_PAGE
  };
}

export function start (wallet: Wallet): SetWalletAction {
  return {
    type: ActionTypes.SET_WALLET,
    value: WalletOp.asOp(wallet).value.id
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
