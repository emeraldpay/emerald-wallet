import { EntryId, Uuid } from '@emeraldpay/emerald-vault-core';
import { AnyCoinCode } from './Asset';
import { BlockchainCode } from './blockchains';

/**
 * =====================================================================================================================
 *
 * Set of interfaces for Persistent Store access and use.
 * The Persistent Store itself is supposed to be split into two parts, one on Electron side that does actual persistence,
 * and another one on the UI side to access it.
 * Implementation of the persisting layer is in the package @emeraldwallet/persistent-state
 *
 * =====================================================================================================================
 */

/**
 * General interface for a multi-page results
 */
export interface PageResult<T> {
  /**
   * Items on the current page
   */
  items: T[];
  /**
   * Optional cursor to request a next page. When it's not set it means there is no following page.
   * The cursor is supposed to be passed when querying the API
   */
  cursor?: string;
}

export interface PageQuery {
  /**
   * Max elements in the resulting page.
   * Default is 100.
   */
  limit?: number;
  /**
   * Optional cursor to continue fetching the results. As returned by `PageResult#cursor`.
   * If not set the query starts from the beginning.
   */
  cursor?: string;
}

export enum State {
  PREPARED = 0,
  SUBMITTED = 10,
  /**
   * When transaction is replaced by another tx, i.e., not included into blockchain.
   */
  REPLACED = 11,
  /**
   * When transaction is included into blockchain. A normal and expected state after submission.
   */
  CONFIRMED = 12,
  /**
   * A state when a transaction was just lost, i.e., not confirmed and not replaced
   */
  DROPPED = 20,
}

export enum Status {
  UNKNOWN = 0,
  OK = 1,
  FAILED = 2,
}

export interface BlockRef {
  height: number;
  blockId: string;
  timestamp: Date;
}

export enum ChangeType {
  UNSPECIFIED = 0,
  TRANSFER = 1,
  FEE = 2,
}

export enum Direction {
  EARN = 0,
  SPEND = 1,
}

export interface Change {
  wallet?: EntryId;
  address?: string;
  hdPath?: string;
  asset: AnyCoinCode;
  /**
   * Amount in the specified asset, represented in the smallest unit (i.e., a SAT, WEI, etc).
   * Note that the amount is always a positive number
   */
  amount: string;
  /**
   * Specified if the amount is EARNED (i.e. a positive sign for amount) or SPENT (i.e., a negative sign)
   */
  direction: Direction;
  type: ChangeType;
}

/**
 * Transaction details
 */
export interface Transaction {
  blockchain: number;
  txId: string;
  /**
   * Timestamp of the moment when the transaction is known to the application. I.e. the moment whe transactions
   * first created.
   */
  sinceTimestamp: Date;
  /**
   * Timestamp of the moment when the transaction is included in a block
   */
  confirmTimestamp?: Date | null;
  /**
   * Application state of the transaction. In general it's PREPARED->SUBMITTED->CONFIRMED, but have other states
   */
  state: State;
  block?: BlockRef | null;
  /**
   * Status of a transaction which is included into blockchain.
   * It may be OK or FAILED. Before the inclusion it's UNKNOWN
   */
  status: Status;
  /**
   * Changes and references to the user wallets
   */
  changes: Change[];
}

/**
 * Criteria to select transactions when queried
 */
export interface TxHistoryFilter {
  /**
   * Require the specified wallet or its entry
   */
  wallet?: Uuid | EntryId;
  /**
   * Require a transaction known or confirmed after the specified moment
   */
  after?: Date;
  /**
   * Require a transaction known or confirmed before the specified moment
   */
  before?: Date;

  /**
   * Requre the specified state
   */
  state?: State;

  /**
   * Requre the specified status
   */
  status?: Status;
}

export interface TxMeta {
  /**
   * Timestamp when the meta was assigned by user
   */
  timestamp: Date;
  /**
   * Blockchain
   */
  blockchain: BlockchainCode;
  /**
   * Transaction ID aka Hash
   */
  txId: string;
  /**
   * Used assigned label
   */
  label?: string;
}

export interface TxMetaStore {
  /**
   * Persist the meta. If an existing meta has an older timestamp get replaced with new, otherwise the it keeps it as is (i.e. always newest meta)
   * @param meta
   * @return the most up-to-date meta, which may be just provided or an existing one
   */
  set(meta: TxMeta): Promise<TxMeta>;

  /**
   * Read meta for a transaction
   *
   * @param blockchain
   * @param txid
   */
  get(blockchain: BlockchainCode, txid: string): Promise<TxMeta | null>;
}

export interface TxHistory {
  /**
   * Add or update existing transaction in the storage
   * @param tx
   * @returns the stored version of just submitted transaction, which may have different values if it's merged/enhanced with already stored data
   */
  submit(tx: Transaction): Promise<Transaction>;

  /**
   * Remove transaction from the storage
   * @param blockchain
   * @param txid
   */
  remove(blockchain: number, txid: string): Promise<void>;

  /**
   * Find transactions under the specified criteria
   * @param filter
   * @param query
   */
  query(filter?: TxHistoryFilter, query?: PageQuery): Promise<PageResult<Transaction>>;

  /**
   * Get current API Cursor for the specified address
   * @param target individual address or xpub
   */
  getCursor(target: string): Promise<string | null>;

  /**
   * Set current cursor received from remote API
   *
   * @param target individual address or xpub
   * @param cursor cursor value
   */
  setCursor(target: string, cursor: string): Promise<void>;
}

/**
 * Addressbook Item details
 */
export interface AddressbookItem {
  id?: string | undefined;
  address: {
    type: 'plain' | 'xpub';
    address: string;
    currentAddress?: string | undefined;
  };
  blockchain: number;
  label?: string | undefined;
  createTimestamp?: Date | undefined;
  updateTimestamp?: Date | undefined;
}

/**
 * Criteria to select address book records when queried
 */
export interface AddressbookFilter {
  /**
   * Filter by blockchain
   */
  blockchain?: number | undefined;
}

export interface Addressbook {
  /**
   * Add or update existing transaction in the storage
   * @param item
   */
  add(item: AddressbookItem): Promise<string>;

  /**
   * Get address book item by id
   * @param id
   */
  get(id: string): Promise<AddressbookItem | null>;

  /**
   * Remove an item from the address book
   * @param id
   */
  remove(id: string): Promise<void>;

  /**
   * Find address book items under the specified criteria
   * @param filter
   * @param query
   */
  query(filter?: AddressbookFilter, query?: PageQuery): Promise<PageResult<AddressbookItem>>;

  /**
   * Update and existing address book item with new values. Currently, it accepts to update only the label and description
   *
   * @param id id of the existing address book
   * @param item updated fields
   */
  update(id: string, item: Partial<AddressbookItem>): Promise<boolean>;
}

export interface XPubPosition {
  /**
   * Get current position at the xpub
   * @param xpub
   */
  get(xpub: string): Promise<number>;

  /**
   * Set the current minimum position for the specified xpub. If the storage knows a larger position it stays on
   * that position, otherwise moves up to the specified.
   *
   * NOTE: It's the next position. I.e., if we have xpub with used address at position N and want to use then next address then set it as N+1 here.
   *
   * @param xpub
   * @param pos
   */
  setAtLeast(xpub: string, pos: number): Promise<void>;
}

export interface PersistentState {
  /**
   * Manage Transaction History
   */
  txhistory: TxHistory;

  /**
   * Manager Address Book
   */
  addressbook: Addressbook;

  /**
   * Manage XPub position
   */
  xpubpos: XPubPosition;
}
