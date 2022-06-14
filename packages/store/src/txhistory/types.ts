import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { IStoredTransaction, PersistentState } from '@emeraldwallet/core';

export enum ActionTypes {
  LOAD_STORED_TXS = 'WALLET/HISTORY/LOAD_STORED_TXS',
  TRACK_TXS = 'WALLET/HISTORY/TRACK_TXS',
  UPDATE_TXS = 'WALLET/HISTORY/UPDATE_TXS',
}

export interface LoadStoredTxsAction {
  type: ActionTypes.LOAD_STORED_TXS;
  transactions: PersistentState.Transaction[];
  walletId: Uuid;
}

export interface TrackTxsAction {
  type: ActionTypes.TRACK_TXS;
  txs: IStoredTransaction[];
}

export interface UpdateTxsAction {
  type: ActionTypes.UPDATE_TXS;
  payload: IStoredTransaction[];
}

export type HistoryAction = LoadStoredTxsAction | TrackTxsAction | UpdateTxsAction;

export interface HistoryState {
  transactions: Map<string, PersistentState.Transaction>;
  walletId?: Uuid;
}
