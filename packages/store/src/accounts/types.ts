import { BlockchainCode } from '@emeraldwallet/core';
import { List, Map } from 'immutable';

export const moduleName = 'addresses';

/**
 * Account contains of many addresses, each Address
 * belongs to particular blockchain.
 */
export class Address {
  public value: string; // Address value itself
  public hardware: boolean;
  public balance: any;
  public balancePending: any;
  public txcount: number;
  public name: string | null = null;
  public description: string | null;
  public hidden: boolean;
  public blockchain: string;

  constructor (value: string, blockchain: string) {
    this.value = value;
    this.hidden = false;
    this.hardware = false;
    this.txcount = 0;
    this.description = null;
    this.blockchain = blockchain;
  }
}

export interface IAddressesState {
  addresses: Address[];
  loading: boolean;
}

export type AddressMap = Map<string, any>;
export type AddressList = List<AddressMap>;

export enum ActionTypes {
  SET_BALANCE = 'ACCOUNT/SET_BALANCE',
  LOADING = 'ACCOUNT/LOADING',
  ADD_ACCOUNT = 'ACCOUNT/ADD_ACCOUNT',
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
  payload: any;
}

export interface SetListAction {
  type: ActionTypes.SET_LIST;
  payload: any;
}

export interface SetBalanceAction {
  type: ActionTypes.SET_BALANCE;
  payload: any;
}

export interface SetLoadingAction {
  type: ActionTypes.LOADING;
  payload: boolean;
}

export interface AddAccountAction {
  type: ActionTypes.ADD_ACCOUNT;
  name: string;
  description: string;
  accountId: string;
  blockchain: string;
}

export interface SetHDPathAction {
  type: ActionTypes.SET_HD_PATH;
  accountId: string;
  hdpath: string;
  blockchain: BlockchainCode;
}

export interface SetTxCountAction {
  type: ActionTypes.SET_TXCOUNT;
  accountId: string;
  value: number;
  blockchain: BlockchainCode;
}

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
  | AddAccountAction
  | SetHDPathAction
  | SetTxCountAction
  | PendingBalanceAction
  | IFetchHdPathsAction
  ;
