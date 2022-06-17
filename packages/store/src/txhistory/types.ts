import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { PersistentState } from '@emeraldwallet/core';

export enum ActionTypes {
  LOAD_STORED_TXS = 'WALLET/HISTORY/LOAD_STORED_TXS',
}

export interface LoadStoredTxsAction {
  type: ActionTypes.LOAD_STORED_TXS;
  transactions: PersistentState.Transaction[];
  walletId: Uuid;
}

export type HistoryAction = LoadStoredTxsAction;

export interface HistoryState {
  transactions: PersistentState.Transaction[];
  walletId?: Uuid;
}
