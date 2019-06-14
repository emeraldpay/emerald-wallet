export const moduleName = "addresses";

/**
 * Account contains of many addresses, each Address
 * belongs to particular blockchain.
 */
export class Address {
  value: string; // Address value itself
  hardware: boolean;
  balance: any;
  balancePending: any;
  txcount: number;
  name: string | null = null;
  description: string | null;
  hidden: boolean;
  blockchain: string;

  constructor(value: string, blockchain: string) {
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

export enum ActionTypes {
  SET_BALANCE = 'ACCOUNT/SET_BALANCE',
  SET_BALANCES = 'ACCOUNT/SET_BALANCES',
  LOADING = 'ACCOUNT/LOADING',
  ADD_ACCOUNT = 'ACCOUNT/ADD_ACCOUNT',
  SET_LIST = 'ACCOUNT/SET_LIST',
  SET_HD_PATH = 'ACCOUNT/SET_HD_PATH',
  UPDATE_ACCOUNT = 'ACCOUNT/UPDATE_ACCOUNT',
  IMPORT_WALLET = 'ACCOUNT/IMPORT_WALLET',
  PENDING_BALANCE = 'ACCOUNT/PENDING_BALANCE',
  SET_TXCOUNT = 'ACCOUNT/SET_TXCOUNT',
}

export interface UpdateAddressAction {
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

export interface LoadingAction {
  type: ActionTypes.LOADING;
}

export type AddressesAction =
  | SetListAction
  | LoadingAction
  | SetBalanceAction
  | UpdateAddressAction;
