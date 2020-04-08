import { BlockchainCode } from '@emeraldwallet/core';

export enum ActionTypes {
  OPEN_ACCOUNT_DETAILS = 'WALLET/OPEN_ACCOUNT_DETAILS'

}

export interface IOpenAccDetailsAction {
  type: ActionTypes.OPEN_ACCOUNT_DETAILS;
  payload: {
    chain: BlockchainCode,
    address: string
  };
}

export type WalletAction = IOpenAccDetailsAction;
