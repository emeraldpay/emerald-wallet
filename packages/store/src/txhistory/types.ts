import {IStoredTransaction} from '@emeraldwallet/core';
import {List, Map} from 'immutable';
import {WalletEntry} from "@emeraldpay/emerald-vault-core/lib/types";
import {IBalanceUpdate} from "../accounts/types";

export enum ActionTypes {
  TRACK_TX = 'WALLET/HISTORY/TRACK_TX',
  TRACK_TXS = 'WALLET/HISTORY/TRACK_TXS',
  LOAD_STORED_TXS = 'WALLET/HISTORY/LOAD_STORED_TXS',
  TRACKED_TX_NOTFOUND = 'WALLET/HISTORY/TRACKED_TX_NOTFOUND',
  UPDATE_TXS = 'WALLET/HISTORY/UPDATE_TXS',
  PENDING_TX = 'WALLET/HISTORY/PENDING_TX',
  BALANCE_TX = 'WALLET/HISTORY/BALANCE_TX',
}

export interface ITrackTxAction {
  type: ActionTypes.TRACK_TX;
  tx: IStoredTransaction;
}

export interface ITrackTxsAction {
  type: ActionTypes.TRACK_TXS;
  txs: IStoredTransaction[];
}

export interface ILoadStoredTxsAction {
  type: ActionTypes.LOAD_STORED_TXS;
  transactions: IStoredTransaction[];
}

export interface IPendingTxAction {
  type: ActionTypes.PENDING_TX;
  txList: IStoredTransaction[];
}

export interface ITrackedTxNotFoundAction {
  type: ActionTypes.TRACKED_TX_NOTFOUND;
  hash: string;
}

export interface IUpdateTxsAction {
  type: ActionTypes.UPDATE_TXS;
  payload: IStoredTransaction[];
}

export interface IBalanceTxAction {
  type: ActionTypes.BALANCE_TX;
  entry: WalletEntry;
  balance: IBalanceUpdate;
}

export type HistoryAction =
  ITrackTxAction
  | ITrackTxsAction
  | ILoadStoredTxsAction
  | IPendingTxAction
  | ITrackedTxNotFoundAction
  | IUpdateTxsAction
  | IBalanceTxAction
  ;

export type TransactionMap = Map<string, any>;
export type TransactionsList = List<TransactionMap>;
