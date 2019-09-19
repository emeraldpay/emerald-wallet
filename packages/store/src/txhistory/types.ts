import { BlockchainCode } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { List, Map } from 'immutable';
import { Transaction } from '../types';

export enum ActionTypes {
  TRACK_TX = 'WALLET/HISTORY/TRACK_TX',
  TRACK_TXS = 'WALLET/HISTORY/TRACK_TXS',
  LOAD_STORED_TXS = 'WALLET/HISTORY/LOAD_STORED_TXS',
  TRACKED_TX_NOTFOUND = 'WALLET/HISTORY/TRACKED_TX_NOTFOUND',
  UPDATE_TXS = 'WALLET/HISTORY/UPDATE_TXS',
  PENDING_TX = 'WALLET/HISTORY/PENDING_TX'
}

export interface TrackTxAction {
  type: ActionTypes.TRACK_TX;
  tx: Transaction;
}

export interface TrackTxsAction {
  type: ActionTypes.TRACK_TXS;
  txs: Transaction[];
}

export interface LoadStoredTxsAction {
  type: ActionTypes.LOAD_STORED_TXS;
  transactions: Transaction[];
}

export interface PendingTxAction {
  type: ActionTypes.PENDING_TX;
  txList: Transaction[];
}

export interface TrackedTxNotFoundAction {
  type: ActionTypes.TRACKED_TX_NOTFOUND;
  hash: string;
}

export interface UpdateTxsAction {
  type: ActionTypes.UPDATE_TXS;
  payload: Transaction[];
}

export type HistoryAction =
  TrackTxAction
  | TrackTxsAction
  | LoadStoredTxsAction
  | PendingTxAction
  | TrackedTxNotFoundAction
  | UpdateTxsAction
  ;

export type TransactionMap = Map<string, any>;
export type TransactionsList = List<TransactionMap>;
