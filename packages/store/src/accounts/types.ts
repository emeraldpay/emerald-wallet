import * as vault from '@emeraldpay/emerald-vault-core';
import { AccountId } from '@emeraldpay/emerald-vault-core';
import { Wei } from '@emeraldplatform/eth';
import {
  Account,
  AnyCoinCode,
  BlockchainCode,
  CurrencyCode,
  Units,
  Wallet
} from '@emeraldwallet/core';

export const moduleName = 'accounts';

export interface IBalanceValue {
  balance: Wei | Units;
  token: CurrencyCode | AnyCoinCode;
}

/**
 * Balance in original "face" value, and converted to a common currency
 */
export interface BalanceValueConverted {
  source: IBalanceValue;
  converted: IBalanceValue;
  rate: number;
}

export interface AccountDetails {
  accountId: AccountId;
  balance?: string;
  balancePending?: any;
  txcount?: number;
}

export interface IAccountsState {
  wallets: Wallet[];
  loading: boolean;
  details: AccountDetails[];
}

export enum ActionTypes {
  LOAD_WALLETS = 'ACCOUNT/LOAD_WALLETS',
  SET_BALANCE = 'ACCOUNT/SET_BALANCE',
  LOADING = 'ACCOUNT/LOADING',
  SET_LIST = 'ACCOUNT/SET_LIST',
  SET_HD_PATH = 'ACCOUNT/SET_HD_PATH',
  FETCH_HD_PATHS = 'ACCOUNT/FETCH_HD_PATHS',
  WALLET_UPDATED = 'ACCOUNT/WALLET_UPDATED',
  PENDING_BALANCE = 'ACCOUNT/PENDING_BALANCE',
  SET_TXCOUNT = 'ACCOUNT/SET_TXCOUNT',
  FETCH_ERC20_BALANCES = 'ACCOUNT/FETCH_ERC20_BALANCES',
  CREATE_WALLET = 'ACCOUNTS/CREATE_WALLET',
  CREATE_WALLET_SUCCESS = 'ACCOUNT/ADD_ACCOUNT',
  ACCOUNT_IMPORTED = 'ACCOUNT/IMPORTED',
  CREATE_HD_ACCOUNT = 'ACCOUNT/CREATE_HD_ACCOUNT',
  HD_ACCOUNT_CREATED = 'ACCOUNT/HD_ACCOUNT_CREATED'
}

export interface ILoadWalletsAction {
  type: ActionTypes.LOAD_WALLETS;
}

export interface IFetchErc20BalancesAction {
  type: ActionTypes.FETCH_ERC20_BALANCES;
}

export interface IFetchHdPathsAction {
  type: ActionTypes.FETCH_HD_PATHS;
}

export interface IUpdateWalletAction {
  type: ActionTypes.WALLET_UPDATED;
  payload: {
    walletId: vault.Uuid,
    name: string;
    description: string;
  };
}

export interface IWalletsLoaded {
  type: ActionTypes.SET_LIST;
  payload: Wallet[];
}

export interface ISetBalanceAction {
  type: ActionTypes.SET_BALANCE;
  payload: {
    blockchain: BlockchainCode,
    address: string,
    value: string
  };
}

export interface ISetLoadingAction {
  type: ActionTypes.LOADING;
  payload: boolean;
}

export interface IWalletCreatedAction {
  type: ActionTypes.CREATE_WALLET_SUCCESS;
  wallet: Wallet;
}

export interface ICreateWalletAction {
  type: ActionTypes.CREATE_WALLET;
  payload: {
    walletName?: string;
    password: string;
    mnemonic: string;
  };
}

export interface ISetTxCountAction {
  type: ActionTypes.SET_TXCOUNT;
  accountId: vault.AccountId;
  value: number;
}

export interface IHdAccountCreated {
  type: ActionTypes.HD_ACCOUNT_CREATED;
  payload: {
    walletId: string,
    account: Account
  };
}

/**
 * @deprecated
 */
export interface PendingBalanceAction {
  type: ActionTypes.PENDING_BALANCE;
  value: string;
  gas: string;
  gasPrice: string;
  from: string;
  to: string;
  blockchain: BlockchainCode;
}

export type AccountsAction =
  | IWalletsLoaded
  | ISetLoadingAction
  | ISetBalanceAction
  | IUpdateWalletAction
  | IWalletCreatedAction
  // | SetHDPathAction
  | ISetTxCountAction
  | PendingBalanceAction
  | IFetchHdPathsAction
  | ILoadWalletsAction
  | ICreateWalletAction
  | IHdAccountCreated
  ;
