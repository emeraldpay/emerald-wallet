import { List, Map } from 'immutable';
import { ITransaction } from '../types';

export enum ActionTypes {
  TRACK_TX = 'WALLET/HISTORY/TRACK_TX',
  TRACK_TXS = 'WALLET/HISTORY/TRACK_TXS',
  LOAD_STORED_TXS = 'WALLET/HISTORY/LOAD_STORED_TXS',
  TRACKED_TX_NOTFOUND = 'WALLET/HISTORY/TRACKED_TX_NOTFOUND',
  UPDATE_TXS = 'WALLET/HISTORY/UPDATE_TXS',
  PENDING_TX = 'WALLET/HISTORY/PENDING_TX'
}

export interface ITrackTxAction {
  type: ActionTypes.TRACK_TX;
  tx: ITransaction;
}

export interface ITrackTxsAction {
  type: ActionTypes.TRACK_TXS;
  txs: ITransaction[];
}

export interface ILoadStoredTxsAction {
  type: ActionTypes.LOAD_STORED_TXS;
  transactions: ITransaction[];
}

export interface IPendingTxAction {
  type: ActionTypes.PENDING_TX;
  txList: ITransaction[];
}

export interface ITrackedTxNotFoundAction {
  type: ActionTypes.TRACKED_TX_NOTFOUND;
  hash: string;
}

export interface IUpdateTxsAction {
  type: ActionTypes.UPDATE_TXS;
  payload: ITransaction[];
}

export type HistoryAction =
  ITrackTxAction
  | ITrackTxsAction
  | ILoadStoredTxsAction
  | IPendingTxAction
  | ITrackedTxNotFoundAction
  | IUpdateTxsAction
  ;

export type TransactionMap = Map<string, any>;
export type TransactionsList = List<TransactionMap>;
