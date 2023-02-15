import { BigAmount } from '@emeraldpay/bigamount';
import {
  AddressRole,
  EntryId,
  IconDetails,
  SeedDescription,
  Uuid,
  Wallet,
  WalletEntry,
} from '@emeraldpay/emerald-vault-core';
import { BalanceUtxo, BlockchainCode, PersistentState, TokenData } from '@emeraldwallet/core';

export const moduleName = 'accounts';

export interface IBalanceValue {
  balance: BigAmount;
}

/**
 * Balance in original "face" value, and converted to a common currency
 */
export interface BalanceValueConverted {
  converted: IBalanceValue;
  rate: number;
  source: IBalanceValue;
}

export interface AccountDetails {
  address: string;
  balance?: string;
  entryId: EntryId;
  txcount?: number;
  utxo?: BalanceUtxo[];
}

export interface IAccountsState {
  details: AccountDetails[];
  icons: Record<string, string | null>;
  loading: boolean;
  seeds: SeedDescription[];
  wallets: Wallet[];
}

export interface IBalanceUpdate {
  address: string;
  entryId: EntryId;
  balance: string;
  utxo?: BalanceUtxo[];
}

export enum ActionTypes {
  ACCOUNT_IMPORTED = 'ACCOUNT/IMPORTED',
  CREATE_HD_ACCOUNT = 'ACCOUNT/CREATE_HD_ACCOUNT',
  CREATE_WALLET = 'ACCOUNTS/CREATE_WALLET',
  CREATE_WALLET_SUCCESS = 'ACCOUNT/ADD_ACCOUNT',
  FETCH_ERC20_BALANCES = 'ACCOUNT/FETCH_ERC20_BALANCES',
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

export interface InitAccountStateAction {
  type: ActionTypes.INIT_STATE;
  balances: PersistentState.Balance[];
  entriesByAddress: Record<string, WalletEntry[]>;
}

export interface ILoadWalletsAction {
  type: ActionTypes.LOAD_WALLETS;
}

export interface IFetchErc20BalancesAction {
  type: ActionTypes.FETCH_ERC20_BALANCES;
  tokens: TokenData[];
}

export interface IFetchHdPathsAction {
  type: ActionTypes.FETCH_HD_PATHS;
}

export interface IUpdateWalletAction {
  type: ActionTypes.WALLET_UPDATED;
  payload: {
    name: string;
    walletId: Uuid;
  };
}

export interface IWalletsLoaded {
  type: ActionTypes.SET_LIST;
  payload: Wallet[];
}

export interface ISetBalanceAction {
  type: ActionTypes.SET_BALANCE;
  payload: IBalanceUpdate;
}

export interface ISetLoadingAction {
  type: ActionTypes.LOADING;
  payload: boolean;
}

export interface IWalletCreatedAction {
  type: ActionTypes.CREATE_WALLET_SUCCESS;
  wallet: Wallet;
}

export interface IWalletImportedAction {
  type: ActionTypes.ACCOUNT_IMPORTED;
  payload: {
    tokens: TokenData[];
    walletId: string;
  };
}

export interface ICreateWalletAction {
  type: ActionTypes.CREATE_WALLET;
  payload: {
    mnemonic: string;
    password: string;
    walletName?: string;
  };
}

export interface ISetTxCountAction {
  type: ActionTypes.SET_TXCOUNT;
  address: string;
  entryId: EntryId;
  value: number;
}

export interface IHdAccountCreated {
  type: ActionTypes.HD_ACCOUNT_CREATED;
  payload: {
    account: WalletEntry;
    walletId: string;
  };
}

export interface ILoadSeedsAction {
  type: ActionTypes.LOAD_SEEDS;
}

export interface ISetSeedsAction {
  type: ActionTypes.SET_SEEDS;
  payload: SeedDescription[];
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

export interface ICreateHdEntry {
  type: ActionTypes.CREATE_HD_ACCOUNT;
  blockchain: BlockchainCode;
  seedId?: Uuid;
  seedPassword: string;
  tokens: TokenData[];
  walletId: Uuid;
}

export interface ISubWalletBalance {
  type: ActionTypes.SUBSCRIBE_WALLET_BALANCE;
  walletId: Uuid;
}

export interface INextAddress {
  type: ActionTypes.NEXT_ADDRESS;
  entryId: EntryId;
  addressRole: AddressRole;
}

export interface SetWalletIconsAction {
  type: ActionTypes.SET_WALLET_ICONS;
  icons: Record<string, string | null>;
}

export type AccountsAction =
  | InitAccountStateAction
  | ILoadWalletsAction
  | IFetchHdPathsAction
  | IUpdateWalletAction
  | IWalletsLoaded
  | ISetBalanceAction
  | ISetLoadingAction
  | IWalletCreatedAction
  | ICreateWalletAction
  | ISetTxCountAction
  | IHdAccountCreated
  | ILoadSeedsAction
  | ISetSeedsAction
  | PendingBalanceAction
  | ISubWalletBalance
  | INextAddress
  | SetWalletIconsAction;
