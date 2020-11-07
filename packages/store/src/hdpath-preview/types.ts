import {AnyCoinCode, BlockchainCode} from "@emeraldwallet/core";
import {MnemonicSeed, SeedReference, Uuid} from "@emeraldpay/emerald-vault-core";

export interface IAddressState {
  blockchain: BlockchainCode;
  asset: AnyCoinCode;
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


/// -----------

export function isNonPartial(value: Partial<IAddressState> | IAddressState): value is IAddressState {
  return typeof value.blockchain != 'undefined'
    && typeof value.asset != 'undefined'
    && typeof value.seed != 'undefined'
    && typeof value.hdpath != 'undefined'
}

export function isEqualSeed(a: SeedReference, b: SeedReference): boolean {
  if (a.type != b.type) {
    return false;
  }
  if (a.type == "ledger") {
    return true;
  }
  if (a.type == "id") {
    if (b.type != "id") { // TypeScript loses type by this point
      return false;
    }
    return typeof a.value == "string" && typeof b.value == "string" && a.value == b.value;
  }
  return false;
}

/// -----------

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
  seed: SeedReference;
  account: number;
  blockchains: BlockchainCode[];
}

export interface ILoadBalances {
  type: ActionTypes.LOAD_BALANCES;
  blockchain: BlockchainCode;
  address: string;
  assets: AnyCoinCode[];
}

export interface ISetAddress {
  type: ActionTypes.SET_ADDRESS;
  seed: SeedReference;
  blockchain: BlockchainCode;
  // hdpath -> address mapping
  addresses: Record<string, string>;
}

export interface ISetBalance {
  type: ActionTypes.SET_BALANCE;
  blockchain: BlockchainCode;
  address: string;
  asset: AnyCoinCode;
  balance: string;
}

export interface IClean {
  type: ActionTypes.CLEAN
}

export interface IDisplayAccount {
  type: ActionTypes.DISPLAY_ACCOUNT,
  account: number
}

export interface IInit {
  type: ActionTypes.INIT;
  seed: SeedReference;
  blockchains: BlockchainCode[];
}

export type IHDPreviewAction =
  ILoadAddresses
  | ILoadBalances
  | ISetAddress
  | ISetBalance
  | IClean
  | IDisplayAccount
  | IInit
  ;