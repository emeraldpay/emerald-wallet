import { BigAmount } from '@emeraldpay/bigamount';
import { EntryId, Uuid } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  PersistentState,
  TokenData,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
} from '@emeraldwallet/core';

export class StoredTransactionChange implements PersistentState.Change {
  amount: string;

  readonly address?: string;
  readonly asset: string;
  readonly direction: PersistentState.Direction;
  readonly hdPath?: string;
  readonly type: PersistentState.ChangeType;
  readonly wallet?: EntryId;

  private readonly blockchain: BlockchainCode;
  private readonly tokenRegistry: TokenRegistry;

  constructor(change: PersistentState.Change, blockchain: BlockchainCode, tokenRegistry: TokenRegistry) {
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
    if (this.tokenRegistry.hasAddress(this.blockchain, this.asset)) {
      return this.tokenRegistry.byAddress(this.blockchain, this.asset).getAmount(this.amount);
    }

    return amountFactory(this.blockchain)(this.amount);
  }

  set amountValue(amount: BigAmount) {
    this.amount = amount.number.toString();
  }
}

export class StoredTransaction implements Omit<PersistentState.Transaction, 'changes'> {
  readonly block?: PersistentState.BlockRef | null;
  readonly blockchain: number;
  readonly changes: StoredTransactionChange[];
  readonly confirmTimestamp?: Date | null;
  readonly meta: PersistentState.TxMetaItem | null;
  readonly sinceTimestamp: Date;
  readonly state: PersistentState.State;
  readonly status: PersistentState.Status;
  readonly txId: string;
  readonly version?: number;

  constructor(tokenRegistry: TokenRegistry, tx: PersistentState.Transaction, meta: PersistentState.TxMetaItem | null) {
    this.blockchain = tx.blockchain;
    this.meta = meta;
    this.sinceTimestamp = tx.sinceTimestamp;
    this.state = tx.state;
    this.status = tx.status;
    this.txId = tx.txId;
    this.version = tx.version;

    if (PersistentState.isConfirmed(tx)) {
      this.block = tx.block;
      this.confirmTimestamp = tx.confirmTimestamp;
    }

    const blockchain = blockchainIdToCode(tx.blockchain);

    this.changes = tx.changes
      .filter((change) => change.asset !== 'UNKNOWN')
      .map((change) => new StoredTransactionChange(change, blockchain, tokenRegistry))
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
