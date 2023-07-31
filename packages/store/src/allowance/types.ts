import { BlockchainCode, Token, TokenAmount, TokenData } from '@emeraldwallet/core';

export enum AllowanceType {
  ALLOWED_FOR = 'allowedFor',
  APPROVED_BY = 'approvedBy',
}

export interface Allowance {
  allowance: TokenAmount;
  available: TokenAmount;
  blockchain: BlockchainCode;
  ownerAddress: string;
  spenderAddress: string;
  token: Token;
  type: AllowanceType;
}

interface ContractAllowance {
  [contractAddress: string]: Allowance[];
}

export interface AllowanceState {
  [blockchain: string]: {
    [address: string]: {
      [AllowanceType.ALLOWED_FOR]: ContractAllowance;
      [AllowanceType.APPROVED_BY]: ContractAllowance;
    };
  };
}

export const moduleName = 'allowance';

export enum ActionTypes {
  SET_ADDRESS_ALLOWANCE = 'WALLET/ALLOWANCE/SET_ADDRESS_ALLOWANCE',
}

export interface SetAddressAllowanceAction {
  type: ActionTypes.SET_ADDRESS_ALLOWANCE;
  payload: {
    allowance: {
      address: string;
      allowance: string;
      available: string;
      blockchain: BlockchainCode;
      contractAddress: string;
      ownerAddress: string;
      spenderAddress: string;
    };
    tokens: TokenData[];
  };
}

export type AllowanceAction = SetAddressAllowanceAction;
