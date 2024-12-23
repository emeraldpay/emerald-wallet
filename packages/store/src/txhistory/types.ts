import { BigAmount } from '@emeraldpay/bigamount';
import { EntryId, Uuid } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  CoinTicker,
  PersistentState,
  TokenData,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
} from '@emeraldwallet/core';

export class StoredTransactionChange implements PersistentState.Change {
  tokenRegistry: TokenRegistry;

  readonly address?: string;
  readonly asset: string;
  readonly direction: PersistentState.Direction;
  readonly hdPath?: string;
  readonly type: PersistentState.ChangeType;
  readonly wallet?: EntryId;

  private _amount: string;

  private readonly _blockchain: BlockchainCode;

  constructor(change: PersistentState.Change, blockchain: BlockchainCode, tokenRegistry: TokenRegistry) {
    this.tokenRegistry = tokenRegistry;

    this.address = change.address;
    this.asset = change.asset;
    this.direction = change.direction;
    this.hdPath = change.hdPath;
    this.type = change.type;
    this.wallet = change.wallet;

    this._amount = change.amount;
    this._blockchain = blockchain;
  }

  get amount(): string {
    return this._amount;
  }

  get amountValue(): BigAmount {
    if (this.tokenRegistry.hasAddress(this._blockchain, this.asset)) {
      return this.tokenRegistry.byAddress(this._blockchain, this.asset).getAmount(this.amount);
    }

    return amountFactory(this._blockchain)(this.amount);
  }

  set amountValue(amount: BigAmount) {
    this._amount = amount.number.toString();
  }

  get blockchain(): BlockchainCode {
    return this._blockchain;
  }
}

export class StoredTransaction implements Omit<PersistentState.Transaction, 'changes'> {
  changes: StoredTransactionChange[];

  readonly block?: PersistentState.BlockRef | null;
  readonly blockPos?: number;
  readonly blockchain: number;
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
      this.blockPos = tx.blockPos;
      this.confirmTimestamp = tx.confirmTimestamp;
    }

    this.changes = this.convertChanges(blockchainIdToCode(tx.blockchain), tx.changes, tokenRegistry);
  }

  set tokenRegistry(tokenRegistry: TokenRegistry) {
    this.changes = this.convertChanges(blockchainIdToCode(this.blockchain), this.changes, tokenRegistry);
  }

  private convertChanges(
    blockchain: BlockchainCode,
    changes: PersistentState.Change[],
    tokenRegistry: TokenRegistry,
  ): StoredTransactionChange[] {
    return changes
      .filter((change) => change.asset in CoinTicker || tokenRegistry.hasAddress(blockchain, change.asset))
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
  UPDATE_TX_TOKENS = 'WALLET/HISTORY/UPDATE_TX_TOKENS',
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
  txIds: string[];
}

export interface UpdateStoredTxAction {
  type: ActionTypes.UPDATE_STORED_TX;
  transactions: {
    transaction: PersistentState.Transaction;
    meta: PersistentState.TxMetaItem | null;
  }[]
  tokens: TokenData[];
  walletId: Uuid;
}

export interface UpdateTxTokensAction {
  type: ActionTypes.UPDATE_TX_TOKENS;
  tokens: TokenData[];
}

export type HistoryAction =
  | LastTxIdAction
  | LoadStoredTxsAction
  | RemoveStoredTxAction
  | UpdateStoredTxAction
  | UpdateTxTokensAction;
