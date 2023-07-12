import { BigAmount } from '@emeraldpay/bigamount';
import { AddressRole, EntryId, SeedDescription, Uuid, Wallet, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, CurrencyAmount, InputUtxo, PersistentState, TokenData } from '@emeraldwallet/core';

export const moduleName = 'accounts';

export enum ActionTypes {
  ACCOUNT_IMPORTED = 'ACCOUNT/IMPORTED',
  CREATE_HD_ACCOUNT = 'ACCOUNT/CREATE_HD_ACCOUNT',
  CREATE_WALLET = 'ACCOUNTS/CREATE_WALLET',
  CREATE_WALLET_SUCCESS = 'ACCOUNT/ADD_ACCOUNT',
  FETCH_HD_PATHS = 'ACCOUNT/FETCH_HD_PATHS',
  HD_ACCOUNT_CREATED = 'ACCOUNT/HD_ACCOUNT_CREATED',
  INIT_STATE = 'ACCOUNT/INIT_STATE',
  LOADING = 'ACCOUNT/LOADING',
  LOAD_SEEDS = 'ACCOUNT/LOAD_SEEDS',
  LOAD_WALLETS = 'ACCOUNT/LOAD_WALLETS',
  NEXT_ADDRESS = 'ACCOUNT/NEXT_ADDRESS',
  PENDING_BALANCE = 'ACCOUNT/PENDING_BALANCE',
  SET_BALANCE = 'ACCOUNT/SET_BALANCE',
  SET_HD_PATH = 'ACCOUNT/SET_HD_PATH',
  SET_LIST = 'ACCOUNT/SET_LIST',
  SET_SEEDS = 'ACCOUNT/SET_SEEDS',
  SET_TXCOUNT = 'ACCOUNT/SET_TXCOUNT',
  SET_WALLET_ICONS = 'ACCOUNT/SET_WALLET_ICONS',
  SET_WALLET_ICONS_CACHE = 'ACCOUNT/SET_WALLET_ICONS_CACHE',
  SUBSCRIBE_WALLET_BALANCE = 'ACCOUNT/SUB_WALLET_BALANCE',
  TRY_UNLOCK_SEED = 'ACCOUNT/TRY_UNLOCK_SEED',
  WALLET_UPDATED = 'ACCOUNT/WALLET_UPDATED',
}

export interface ConvertedBalance<T = BigAmount> {
  balance: T;
  fiatBalance: CurrencyAmount | undefined;
}

export interface AccountBalance {
  address: string;
  entryId: EntryId;
  balance: string;
  utxo?: InputUtxo[];
}

export interface AccountDetails {
  address: string;
  balance?: string;
  entryId: EntryId;
  txcount?: number;
  utxo?: InputUtxo[];
}

export interface AccountsState {
  details: AccountDetails[];
  icons: Record<string, string | null>;
  loading: boolean;
  seeds: SeedDescription[];
  wallets: Wallet[];
}

export interface CreateHdEntryAction {
  type: ActionTypes.CREATE_HD_ACCOUNT;
  blockchain: BlockchainCode;
  seedId?: Uuid;
  seedPassword: string;
  walletId: Uuid;
}

export interface CreateWalletAction {
  type: ActionTypes.CREATE_WALLET;
  payload: {
    mnemonic: string;
    password: string;
    walletName?: string;
  };
}

export interface FetchHdPathsAction {
  type: ActionTypes.FETCH_HD_PATHS;
}

export interface HdAccountCreatedAction {
  type: ActionTypes.HD_ACCOUNT_CREATED;
  payload: {
    account: WalletEntry;
    walletId: string;
  };
}

export interface InitAccountStateAction {
  type: ActionTypes.INIT_STATE;
  balances: PersistentState.Balance[];
  entriesByAddress: Record<string, WalletEntry[]>;
}

export interface LoadSeedsAction {
  type: ActionTypes.LOAD_SEEDS;
}

export interface LoadWalletsAction {
  type: ActionTypes.LOAD_WALLETS;
}

export interface NextAddressAction {
  type: ActionTypes.NEXT_ADDRESS;
  entryId: EntryId;
  addressRole: AddressRole;
}

/**
 * @deprecated
 */
export interface PendingBalanceAction {
  type: ActionTypes.PENDING_BALANCE;
  blockchain: BlockchainCode;
  from: string;
  gas: string;
  gasPrice: string;
  to: string;
  value: string;
}

export interface SetBalanceAction {
  type: ActionTypes.SET_BALANCE;
  payload: AccountBalance;
}

export interface SetLoadingAction {
  type: ActionTypes.LOADING;
  payload: boolean;
}

export interface SetSeedsAction {
  type: ActionTypes.SET_SEEDS;
  payload: SeedDescription[];
}

export interface SetTxCountAction {
  type: ActionTypes.SET_TXCOUNT;
  address: string;
  entryId: EntryId;
  value: number;
}

export interface SetWalletIconsAction {
  type: ActionTypes.SET_WALLET_ICONS;
  icons: Record<string, string | null>;
}

export interface SubscribeWalletBalance {
  type: ActionTypes.SUBSCRIBE_WALLET_BALANCE;
  walletId: Uuid;
}

export interface UpdateWalletAction {
  type: ActionTypes.WALLET_UPDATED;
  payload: {
    name: string;
    walletId: Uuid;
  };
}

export interface WalletCreatedAction {
  type: ActionTypes.CREATE_WALLET_SUCCESS;
  wallet: Wallet;
}

export interface WalletImportedAction {
  type: ActionTypes.ACCOUNT_IMPORTED;
  payload: {
    tokens: TokenData[];
    walletId: string;
  };
}

export interface WalletsLoadedAction {
  type: ActionTypes.SET_LIST;
  payload: Wallet[];
}

export type AccountsAction =
  | CreateHdEntryAction
  | CreateWalletAction
  | FetchHdPathsAction
  | HdAccountCreatedAction
  | InitAccountStateAction
  | LoadSeedsAction
  | LoadWalletsAction
  | NextAddressAction
  | PendingBalanceAction
  | SetBalanceAction
  | SetLoadingAction
  | SetSeedsAction
  | SetTxCountAction
  | SetWalletIconsAction
  | SubscribeWalletBalance
  | UpdateWalletAction
  | WalletCreatedAction
  | WalletImportedAction
  | WalletsLoadedAction;
