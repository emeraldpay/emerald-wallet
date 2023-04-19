import { BigAmount } from '@emeraldpay/bigamount';
import { Uuid } from '@emeraldpay/emerald-vault-core';
import { PersistentState, TokenData, TokenRegistry, amountFactory, blockchainIdToCode } from '@emeraldwallet/core';

export class StoredTransactionChange implements PersistentState.Change {
  amount: string;
  address?: string;
  asset: string;
  direction: PersistentState.Direction;
  hdPath?: string;
  type: PersistentState.ChangeType;
  wallet?: string;

  private readonly blockchain: number;
  private readonly tokenRegistry: TokenRegistry;

  constructor(tokenRegistry: TokenRegistry, blockchain: number, change: PersistentState.Change) {
    this.amount = change.amount;
    this.address = change.address;
    this.asset = change.asset;
    this.direction = change.direction;
    this.hdPath = change.hdPath;
    this.type = change.type;
    this.wallet = change.wallet;

    this.blockchain = blockchain;
    this.tokenRegistry = tokenRegistry;
  }

  get amountValue(): BigAmount {
    const blockchain = blockchainIdToCode(this.blockchain);

    if (this.tokenRegistry.hasSymbol(blockchain, this.asset)) {
      return this.tokenRegistry.bySymbol(blockchain, this.asset).getAmount(this.amount);
    }

    return amountFactory(blockchain)(this.amount);
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
  version?: number;

  meta: PersistentState.TxMetaItem | null;

  changes: StoredTransactionChange[];

  constructor(tokenRegistry: TokenRegistry, tx: PersistentState.Transaction, meta: PersistentState.TxMetaItem | null) {
    this.blockchain = tx.blockchain;
    this.sinceTimestamp = tx.sinceTimestamp;
    this.state = tx.state;
    this.status = tx.status;
    this.txId = tx.txId;
    this.version = tx.version;

    if (PersistentState.isConfirmed(tx)) {
      this.block = tx.block;
      this.confirmTimestamp = tx.confirmTimestamp;
    }

    this.meta = meta;

    this.changes = tx.changes
      .filter((change) => change.asset !== 'UNKNOWN')
      .map((change) => new StoredTransactionChange(tokenRegistry, tx.blockchain, change))
      .filter((change) => change.amountValue.isPositive())
      .sort((first, second) => {
        if (first.direction === second.direction) {
          return 0;
        }

        return first.direction > second.direction ? -1 : 1;
      });
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
  REMOVE_STORED_TX = 'WALLET/HISTORY/REMOVE_STORED_TX',
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

export interface RemoveStoredTxAction {
  type: ActionTypes.REMOVE_STORED_TX;
  txId: string;
}

export interface UpdateStoredTxAction {
  type: ActionTypes.UPDATE_STORED_TX;
  meta: PersistentState.TxMetaItem | null;
  tokens: TokenData[];
  transaction: PersistentState.Transaction;
  walletId: Uuid;
}

export type HistoryAction = LastTxIdAction | LoadStoredTxsAction | RemoveStoredTxAction | UpdateStoredTxAction;
