import {AnyCoinCode, AnyTokenCode, Blockchain, BlockchainCode, CurrencyCode, Units} from '@emeraldwallet/core';
import * as vault from '@emeraldpay/emerald-vault-core';
import {Wei} from "@emeraldplatform/eth";
import { AccountId } from '@emeraldpay/emerald-vault-core';
import BigNumber from "bignumber.js";

export const moduleName = 'addresses';

export type BalanceValue = {
  balance: Wei | Units,
  token: CurrencyCode | AnyCoinCode,
}

/**
 * Balance in original "face" value, and converted to a common currency
 */
export type BalanceValueConverted = {
  source: BalanceValue,
  converted: BalanceValue,
  rate: number
}

export type AccountDetails = {
  accountId: AccountId,
  balance?: string,
  balancePending?: any,
  txcount?: number
}

export interface IAddressesState {
  wallets: vault.Wallet[];
  loading: boolean;
  details: AccountDetails[];
}

export type WalletsList = vault.Wallet[];

export enum ActionTypes {
  SET_BALANCE = 'ACCOUNT/SET_BALANCE',
  LOADING = 'ACCOUNT/LOADING',
  ADD_WALLET = 'ACCOUNT/ADD_ACCOUNT',
  SET_LIST = 'ACCOUNT/SET_LIST',
  SET_HD_PATH = 'ACCOUNT/SET_HD_PATH',
  FETCH_HD_PATHS = 'ACCOUNT/FETCH_HD_PATHS',
  UPDATE_ACCOUNT = 'ACCOUNT/UPDATE_ACCOUNT',
  PENDING_BALANCE = 'ACCOUNT/PENDING_BALANCE',
  SET_TXCOUNT = 'ACCOUNT/SET_TXCOUNT',
  FETCH_ERC20_BALANCES = 'ACCOUNT/FETCH_ERC20_BALANCES'
}

export interface IFetchErc20BalancesAction {
  type: ActionTypes.FETCH_ERC20_BALANCES;
}

export interface IFetchHdPathsAction {
  type: ActionTypes.FETCH_HD_PATHS;
}

export interface IUpdateAddressAction {
  type: ActionTypes.UPDATE_ACCOUNT;
  payload: {
    walletId: vault.Uuid,
    name: string;
    description: string;
  };
}

export interface SetListAction {
  type: ActionTypes.SET_LIST;
  payload: vault.Wallet[];
}

export interface SetBalanceAction {
  type: ActionTypes.SET_BALANCE;
  payload: {
    blockchain: BlockchainCode,
    address: string,
    value: string
  }
}

export interface SetLoadingAction {
  type: ActionTypes.LOADING;
  payload: boolean;
}

export interface AddWalletAction {
  type: ActionTypes.ADD_WALLET;
  wallet: vault.Wallet,
}

export interface SetTxCountAction {
  type: ActionTypes.SET_TXCOUNT;
  accountId: vault.AccountId;
  value: number;
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
export type AddressesAction =
  | SetListAction
  | SetLoadingAction
  | SetBalanceAction
  | IUpdateAddressAction
  | AddWalletAction
  // | SetHDPathAction
  | SetTxCountAction
  | PendingBalanceAction
  | IFetchHdPathsAction
  ;
