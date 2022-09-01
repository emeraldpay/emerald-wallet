import { BigAmount, Unit, Units } from '@emeraldpay/bigamount';
import { Uuid } from '@emeraldpay/emerald-vault-core';
import {
  AnyCoinCode,
  PersistentState,
  amountFactory,
  blockchainIdToCode,
  isSupportedTokenCode,
  tokenAmount,
} from '@emeraldwallet/core';

export class StoredTransactionChange implements PersistentState.Change {
  amount: string;
  address?: string;
  asset: AnyCoinCode;
  direction: PersistentState.Direction;
  hdPath?: string;
  type: PersistentState.ChangeType;
  wallet?: string;
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
    if (this.asset === 'UNKNOWN') {
      return new BigAmount(this.amount, new Units([new Unit(18, 'Unknown token', '???')]));
    }

    if (isSupportedTokenCode(this.asset)) {
      return tokenAmount(this.amount, this.asset);
    }

    return amountFactory(blockchainIdToCode(this._blockchain))(this.amount);
  }

  set amountValue(amount: BigAmount) {
    this.amount = amount.number.toString();
  }
}

export class StoredTransaction implements Omit<PersistentState.Transaction, 'changes'> {
  block?: PersistentState.BlockRef | null;
  blockchain: number;
  confirmTimestamp?: Date | null;
  sinceTimestamp: Date;
  state: PersistentState.State;
  status: PersistentState.Status;
  txId: string;

  changes: StoredTransactionChange[];
  meta: PersistentState.TxMeta | null;

  constructor(tx: PersistentState.Transaction, meta: PersistentState.TxMeta | null) {
    this.block = tx.block;
    this.blockchain = tx.blockchain;
    this.confirmTimestamp = tx.confirmTimestamp;
    this.sinceTimestamp = tx.sinceTimestamp;
    this.state = tx.state;
    this.status = tx.status;
    this.txId = tx.txId;

    this.changes = tx.changes.map((change) => new StoredTransactionChange(tx.blockchain, change));
    this.meta = meta;
  }
}

export interface HistoryState {
  cursor?: string;
  walletId?: Uuid;
  lastTxId: string | null;
  transactions: StoredTransaction[];
}

export enum ActionTypes {
  LOAD_STORED_TXS = 'WALLET/HISTORY/LOAD_STORED_TXS',
  SET_LAST_TX_ID = 'WALLET/HISTORY/SET_LAST_TX_ID',
  UPDATE_STORED_TX = 'WALLET/HISTORY/UPDATE_STORED_TX',
}

export interface LastTxIdAction {
  type: ActionTypes.SET_LAST_TX_ID;
  txId: string | null;
}

export interface LoadStoredTxsAction {
  type: ActionTypes.LOAD_STORED_TXS;
  cursor?: string;
  transactions: StoredTransaction[];
  walletId: Uuid;
}

export interface UpdateStoredTxAction {
  type: ActionTypes.UPDATE_STORED_TX;
  meta: PersistentState.TxMeta | null;
  transaction: PersistentState.Transaction;
  walletId: Uuid;
}

export type HistoryAction = LastTxIdAction | LoadStoredTxsAction | UpdateStoredTxAction;
