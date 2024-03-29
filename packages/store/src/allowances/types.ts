import { address as AddressApi } from '@emeraldpay/api';
import { BlockchainCode, Token, TokenAmount, TokenData } from '@emeraldwallet/core';

export const moduleName = 'allowance';

export enum AllowanceType {
  ALLOWED_FOR = 'allowedFor',
  APPROVED_BY = 'approvedBy',
}

export interface Allowance {
  allowance: TokenAmount;
  available: TokenAmount;
  blockchain: BlockchainCode;
  ownerAddress: string;
  ownerControl?: AddressApi.AddressControl;
  spenderAddress: string;
  spenderControl?: AddressApi.AddressControl;
  token: Token;
  timestamp: number;
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

export enum ActionTypes {
  INIT_ALLOWANCE = 'WALLET/ALLOWANCE/INIT_ALLOWANCE',
  REMOVE_ALLOWANCE = 'WALLET/ALLOWANCE/REMOVE_ALLOWANCE',
  SET_ALLOWANCE = 'WALLET/ALLOWANCE/SET_ALLOWANCE',
}

export interface AllowanceRaw {
  address: string;
  allowance: string;
  available: string;
  blockchain: BlockchainCode;
  contractAddress: string;
  ownerAddress: string;
  spenderAddress: string;
  timestamp: number;
}

interface AllowanceCommon extends AllowanceRaw {
  ownerControl?: AddressApi.AddressControl;
  spenderControl?: AddressApi.AddressControl;
}

export interface InitAllowanceAction {
  type: ActionTypes.INIT_ALLOWANCE;
  payload: {
    allowance: AllowanceCommon;
    tokens: TokenData[];
  };
}

export interface RemoveAllowanceAction {
  type: ActionTypes.REMOVE_ALLOWANCE;
  payload: {
    address: string;
    blockchain: BlockchainCode;
    timestamp: number;
  };
}

export interface SetAllowanceAction {
  type: ActionTypes.SET_ALLOWANCE;
  payload: {
    allowance: AllowanceCommon;
    tokens: TokenData[];
  };
}

export type AllowanceAction = InitAllowanceAction | RemoveAllowanceAction | SetAllowanceAction;
