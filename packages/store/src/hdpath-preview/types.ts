import {AnyCoinCode, BlockchainCode} from "@emeraldwallet/core";
import {Uuid} from "@emeraldpay/emerald-vault-core";

export interface IAddressState {
  blockchain: BlockchainCode;
  asset: AnyCoinCode;
  seed: SourceSeed;
  hdpath: string;
  address?: string;
  balance?: string;
}

export interface IDisplay {
  account: number
}

export interface IHDPreviewState {
  accounts: IAddressState[];
  display: IDisplay;
}

export interface SeedRef {
  type: 'seed-ref';
  seedId: Uuid;
  //TODO make some secure storage on Electron side
  password?: string;
}

export type SourceSeed = SeedRef;

/// -----------

export function isNonPartial(value: Partial<IAddressState> | IAddressState): value is IAddressState {
  return typeof value.blockchain != 'undefined'
    && typeof value.asset != 'undefined'
    && typeof value.seed != 'undefined'
    && typeof value.hdpath != 'undefined'
}

export function isEqualSeed(a: SourceSeed, b: SourceSeed): boolean {
  return a.type == b.type && a.seedId == b.seedId;
}

/// -----------

export enum ActionTypes {
  LOAD_ADDRESSES = 'HDPREVIEW/LOAD_ADDRESSES',
  LOAD_BALANCES = 'HDPREVIEW/LOAD_BALANCES',
  SET_ADDRESS = 'HDPREVIEW/SET_ADDRESS',
  SET_BALANCE = 'HDPREVIEW/SET_BALANCE',
  CLEAN = 'HDPREVIEW/CLEAN',
  DISPLAY_ACCOUNT = 'HDPREVIEW/DISPLAY_ACCOUNT'
}

export interface ILoadAddresses {
  type: ActionTypes.LOAD_ADDRESSES;
  seed: SourceSeed;
  hdpath: string;
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
  seed: SourceSeed;
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

export type IHDPreviewAction =
  ILoadAddresses
  | ILoadBalances
  | ISetAddress
  | ISetBalance
  | IClean
  | IDisplayAccount
  ;