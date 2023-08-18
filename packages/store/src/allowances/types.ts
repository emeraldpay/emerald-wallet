import { DescribeAddressControl } from '@emeraldpay/api';
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
  ownerControl?: DescribeAddressControl;
  spenderAddress: string;
  spenderControl?: DescribeAddressControl;
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

export enum ActionTypes {
  INIT_ALLOWANCE = 'WALLET/ALLOWANCE/INIT_ALLOWANCE',
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
}

interface AllowanceCommon extends AllowanceRaw {
  ownerControl?: DescribeAddressControl;
  spenderControl?: DescribeAddressControl;
}

export interface InitAllowanceAction {
  type: ActionTypes.INIT_ALLOWANCE;
  payload: {
    allowance: AllowanceCommon;
    tokens: TokenData[];
  };
}

export interface SetAllowanceAction {
  type: ActionTypes.SET_ALLOWANCE;
  payload: {
    allowance: AllowanceCommon;
    tokens: TokenData[];
  };
}

export type AllowanceAction = InitAllowanceAction | SetAllowanceAction;
