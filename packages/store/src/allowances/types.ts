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

export function isAllowanceEqual(left?: Allowance, right?: Allowance): boolean {
  if (left == null && right == null) {
    return true;
  }
  if (left == null || right == null) {
    return false;
  }
  if (!left.allowance.equals(right.allowance)) {
    return false
  }
  if (!left.available.equals(right.available)) {
    return false;
  }
  if (left.blockchain !== right.blockchain) {
    return false;
  }
  if (left.ownerAddress !== right.ownerAddress) {
    return false;
  }
  if (left.spenderAddress !== right.spenderAddress) {
    return false;
  }
  if (left.token.address !== right.token.address) {
    return false;
  }
  if (left.timestamp !== right.timestamp) {
    return false;
  }
  if (left.type !== right.type) {
    return false;
  }
  return true;
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
  /**
   * User's address. Either owner or spender, doesn't matter just any of the sides that belongs to the user because it's used as a key in the state
   */
  address: string;
  /**
   * The max amount allowed
   */
  allowance: string;
  /**
   * Actual amount that can be used (on owner's balance)
   */
  available: string;
  blockchain: BlockchainCode;
  /**
   * ERC20 address
   */
  contractAddress: string;
  /**
   * Who has provided the allowance
   */
  ownerAddress: string;
  /**
   * Who can spend the allowance
   */
  spenderAddress: string;
  timestamp: number;
}

export interface AllowanceCommon extends AllowanceRaw {
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
  allowances: AllowanceCommon[];
  tokens: TokenData[];
}

export type AllowanceAction = InitAllowanceAction | RemoveAllowanceAction | SetAllowanceAction;
