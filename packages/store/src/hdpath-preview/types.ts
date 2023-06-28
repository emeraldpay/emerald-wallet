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
  return value.asset != null && value.blockchain != null && value.hdpath != null && value.seed != null;
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
  SET_ADDRESS = 'HDPREVIEW/SET_ADDRESS',
  SET_BALANCE = 'HDPREVIEW/SET_BALANCE',
  CLEAN = 'HDPREVIEW/CLEAN',
  DISPLAY_ACCOUNT = 'HDPREVIEW/DISPLAY_ACCOUNT',
  INIT = 'HDPREVIEW/INIT',
}

export interface ILoadAddresses {
  type: ActionTypes.LOAD_ADDRESSES;
  account: number;
  blockchain: BlockchainCode;
  index?: number;
  seed: SeedReference;
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
  address: string;
  asset: string;
  balance: string;
  blockchain: BlockchainCode;
  hdpath: string;
  seed: SeedReference;
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

export type IHDPreviewAction = ILoadAddresses | ISetAddress | ISetBalance | IClean | IDisplayAccount | IInit;

export type HDPathAddresses = Partial<Record<BlockchainCode, string>>;
export type HDPathIndexes = { [blockchain: string]: number | undefined };
