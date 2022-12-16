import { SeedReference } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';

export interface IAddressState {
  blockchain: BlockchainCode;
  asset: string;
  seed: SeedReference;
  hdpath: string;
  address?: string;
  xpub?: string;
  balance?: string;
}

// only to reference, actual data is in IAddressState
export interface Entry {
  blockchain: BlockchainCode;
  hdpath: string;
}

export interface IDisplay {
  account: number;
  entries: Entry[];
  seed?: SeedReference;
  blockchains: BlockchainCode[];
}

export interface IHDPreviewState {
  // addresses details, keeps them separate from current display for caching.
  // also used for creation to get known xpub
  accounts: IAddressState[];
  display: IDisplay;
  active: boolean;
}

export function isNonPartial(value: Partial<IAddressState> | IAddressState): value is IAddressState {
  return (
    typeof value.blockchain != 'undefined' &&
    typeof value.asset != 'undefined' &&
    typeof value.seed != 'undefined' &&
    typeof value.hdpath != 'undefined'
  );
}

export function isEqualSeed(first: SeedReference, second: SeedReference): boolean {
  if (first.type !== second.type) {
    return false;
  }

  if (first.type === 'ledger') {
    return true;
  }

  if (first.type === 'id') {
    if (second.type !== 'id') {
      return false;
    }

    return first.value === second.value;
  }

  return false;
}

export enum ActionTypes {
  LOAD_ADDRESSES = 'HDPREVIEW/LOAD_ADDRESSES',
  LOAD_BALANCES = 'HDPREVIEW/LOAD_BALANCES',
  SET_ADDRESS = 'HDPREVIEW/SET_ADDRESS',
  SET_BALANCE = 'HDPREVIEW/SET_BALANCE',
  CLEAN = 'HDPREVIEW/CLEAN',
  DISPLAY_ACCOUNT = 'HDPREVIEW/DISPLAY_ACCOUNT',
  INIT = 'HDPREVIEW/INIT',
}

export interface ILoadAddresses {
  type: ActionTypes.LOAD_ADDRESSES;
  account: number;
  assets: string[];
  blockchain: BlockchainCode;
  index?: number;
  seed: SeedReference;
}

export interface ILoadBalances {
  type: ActionTypes.LOAD_BALANCES;
  blockchain: BlockchainCode;
  address: string;
  assets: string[];
}

export interface ISetAddress {
  type: ActionTypes.SET_ADDRESS;
  addresses: Record<string, string>;
  assets: string[];
  blockchain: BlockchainCode;
  seed: SeedReference;
}

export interface ISetBalance {
  type: ActionTypes.SET_BALANCE;
  blockchain: BlockchainCode;
  address: string;
  asset: string;
  balance: string;
}

export interface IClean {
  type: ActionTypes.CLEAN;
}

export interface IDisplayAccount {
  type: ActionTypes.DISPLAY_ACCOUNT;
  account: number;
  indexes?: HDPathIndexes;
}

export interface IInit {
  type: ActionTypes.INIT;
  seed: SeedReference;
  blockchains: BlockchainCode[];
}

export type IHDPreviewAction =
  | ILoadAddresses
  | ILoadBalances
  | ISetAddress
  | ISetBalance
  | IClean
  | IDisplayAccount
  | IInit;

export type HDPathIndexes = { [blockchain: string]: number | undefined };
