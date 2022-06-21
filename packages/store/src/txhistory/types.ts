import { BigAmount } from '@emeraldpay/bigamount';
import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { amountFactory, AnyCoinCode, blockchainIdToCode, PersistentState } from '@emeraldwallet/core';

export enum ActionTypes {
  LOAD_STORED_TXS = 'WALLET/HISTORY/LOAD_STORED_TXS',
  UPDATE_STORED_TX = 'WALLET/HISTORY/UPDATE_STORED_TX',
}

export class StoredTransactionChange implements PersistentState.Change {
  amount: string;
  address?: string | undefined;
  asset: AnyCoinCode;
  direction: 'EARN' | 'SPEND';
  hdPath?: string | undefined;
  type: 'TRANSFER' | 'FEE';
  wallet?: string | undefined;
  private readonly _blockchain: number;

  constructor(blockchain: number, change: PersistentState.Change) {
    this._blockchain = blockchain;

    this.amount = change.amount;
    this.address = change.address;
    this.asset = change.asset;
    this.direction = change.direction;
    this.hdPath = change.hdPath;
    this.type = change.type;
    this.wallet = change.wallet;
  }

  get amountValue(): BigAmount {
    const factory = amountFactory(blockchainIdToCode(this._blockchain));

    return factory(this.amount);
  }

  set amountValue(amount: BigAmount) {
    this.amount = amount.number.toString();
  }
}

export class StoredTransaction implements Omit<PersistentState.Transaction, 'changes'> {
  block?: PersistentState.BlockRef | null | undefined;
  blockchain: number;
  confirmTimestamp?: Date | null | undefined;
  sinceTimestamp: Date;
  state: PersistentState.State;
  status: PersistentState.Status;
  txId: string;

  changes: StoredTransactionChange[];

  constructor(tx: PersistentState.Transaction) {
    this.block = tx.block;
    this.blockchain = tx.blockchain;
    this.confirmTimestamp = tx.confirmTimestamp;
    this.sinceTimestamp = tx.sinceTimestamp;
    this.state = tx.state;
    this.status = tx.status;
    this.txId = tx.txId;

    this.changes = tx.changes.map((change) => new StoredTransactionChange(tx.blockchain, change));
  }
}

export interface LoadStoredTxsAction {
  type: ActionTypes.LOAD_STORED_TXS;
  transactions: StoredTransaction[];
  walletId: Uuid;
}

export interface UpdateStoredTxAction {
  type: ActionTypes.UPDATE_STORED_TX;
  transaction: StoredTransaction;
}

export type HistoryAction = LoadStoredTxsAction | UpdateStoredTxAction;

export interface HistoryState {
  transactions: StoredTransaction[];
  walletId?: Uuid;
}
