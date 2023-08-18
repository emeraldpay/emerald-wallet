import { SeedReference } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';

export const moduleName = 'hdpathPreview';

export interface AccountState {
  address?: string;
  asset: string;
  balance?: string | null;
  blockchain: BlockchainCode;
  hdpath: string;
  seed: SeedReference;
  xpub?: string;
}

/**
 * Only to reference, actual data is in AddressState.
 */
export interface Entry {
  blockchain: BlockchainCode;
  hdpath: string;
}

export interface Display {
  account: number;
  entries: Entry[];
  seed?: SeedReference;
  blockchains: BlockchainCode[];
}

export interface HDPreviewState {
  /**
   * Addresses details, keeps them separate from current display for caching.
   * Also used for creation to get known xpub.
   */
  accounts: AccountState[];
  display: Display;
  active: boolean;
}

export function isNonPartial(value: Partial<AccountState> | AccountState): value is AccountState {
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
  CLEAN_ACCOUNT = 'HDPREVIEW/CLEAN_ACCOUNT',
  DISPLAY_ACCOUNT = 'HDPREVIEW/DISPLAY_ACCOUNT',
  INIT_ACCOUNT = 'HDPREVIEW/INIT_ACCOUNT',
  LOAD_ADDRESSES = 'HDPREVIEW/LOAD_ADDRESSES',
  SET_ADDRESSES = 'HDPREVIEW/SET_ADDRESSES',
}

export interface CleanAccountAction {
  type: ActionTypes.CLEAN_ACCOUNT;
}

export interface DisplayAccountAction {
  type: ActionTypes.DISPLAY_ACCOUNT;
  payload: {
    account: number;
    indexes?: HDPathIndexes;
  };
}

export interface InitAccountAction {
  type: ActionTypes.INIT_ACCOUNT;
  payload: {
    seed: SeedReference;
    blockchains: BlockchainCode[];
  };
}

export interface LoadAddressesAction {
  type: ActionTypes.LOAD_ADDRESSES;
  payload: {
    account: number;
    blockchain: BlockchainCode;
    index?: number;
    seed: SeedReference;
  };
}

export type AddressBalances = Record<string, string | null | undefined>;

export interface SetAddressesAction {
  type: ActionTypes.SET_ADDRESSES;
  payload: {
    addresses: Record<string, string>;
    balances: AddressBalances;
    assets: string[];
    blockchain: BlockchainCode;
    seed: SeedReference;
  };
}

export type HDPreviewActions =
  | CleanAccountAction
  | DisplayAccountAction
  | InitAccountAction
  | LoadAddressesAction
  | SetAddressesAction;

export type HDPathAddresses = Partial<Record<BlockchainCode, string>>;
export type HDPathIndexes = Partial<Record<BlockchainCode, number | undefined>>;
