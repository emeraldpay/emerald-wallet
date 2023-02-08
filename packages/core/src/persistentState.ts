import { EntryId, Uuid } from '@emeraldpay/emerald-vault-core';
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

export type BitcoinAddress = string;
export type EthereumAddress = string;
export type Address = BitcoinAddress | EthereumAddress;
export type XPub = string;

export interface PageQuery {
  /**
   * Optional cursor to continue fetching the results. As returned by `PageResult#cursor`.
   * If not set the query starts from the beginning.
   */
  cursor?: string;
  /**
   * Max elements in the resulting page.
   * Default is 100.
   */
  limit?: number;
}

/**
 * General interface for a multi-page results
 */
export interface PageResult<T> {
  /**
   * Optional cursor to request a next page. When it's not set it means there is no following page.
   * The cursor is supposed to be passed when querying the API
   */
  cursor?: string;
  /**
   * Items on the current page
   */
  items: T[];
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

export enum ChangeType {
  UNSPECIFIED = 0,
  TRANSFER = 1,
  FEE = 2,
}

export enum Direction {
  EARN = 0,
  SPEND = 1,
}

export enum Status {
  UNKNOWN = 0,
  OK = 1,
  FAILED = 2,
}

export interface BlockRef {
  blockId: string;
  height: number;
  timestamp: Date;
}

export interface Change {
  address?: Address;
  /**
   * Amount in the specified asset, represented in the smallest unit (i.e., a SAT, WEI, etc).
   * Note that the amount is always a positive number
   */
  amount: string;
  asset: string;
  /**
   * Specified if the amount is EARNED (i.e. a positive sign for amount) or SPENT (i.e., a negative sign)
   */
  direction: Direction;
  hdPath?: string;
  type: ChangeType;
  wallet?: EntryId;
}

/**
 * Transaction details
 */
export interface Transaction {
  block?: BlockRef | null;
  blockchain: number;
  /**
   * Changes and references to the user wallets
   */
  changes: Change[];
  /**
   * Timestamp of the moment when the transaction is included in a block
   */
  confirmTimestamp?: Date | null;
  /**
   * Application state of the transaction. In general, it's PREPARED->SUBMITTED->CONFIRMED, but have other states
   */
  state: State;
  /**
   * Timestamp of the moment when the transaction is known to the application. I.e. the moment whe transactions
   * first created.
   */
  sinceTimestamp: Date;
  /**
   * Status of a transaction which is included into blockchain.
   * It may be OK or FAILED. Before the inclusion it's UNKNOWN
   */
  status: Status;
  txId: string;
  version?: number;
}

/**
 * Criteria to select transactions when queried
 */
export interface TxHistoryFilter {
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
  /**
   * Require the specified wallet or its entry
   */
  wallet?: Uuid | EntryId;
}

export interface TxHistory {
  /**
   * Get current API Cursor for the specified address
   *
   * @param target individual address or xpub
   */
  getCursor(target: Address | XPub): Promise<string | null>;
  /**
   * Set current cursor received from remote API
   *
   * @param target individual address or xpub
   * @param cursor cursor value
   */
  setCursor(target: Address | XPub, cursor: string): Promise<void>;
  /**
   * Remove transaction from the storage
   */
  remove(blockchain: number, txid: string): Promise<void>;
  /**
   * Add or update existing transaction in the storage
   *
   * @returns the stored version of just submitted transaction, which may have different values if it's merged/enhanced with already stored data
   */
  submit(tx: Transaction): Promise<Transaction>;
  /**
   * Find transactions under the specified criteria
   */
  query(filter?: TxHistoryFilter, query?: PageQuery): Promise<PageResult<Transaction>>;
}

export interface TxMetaItem {
  /**
   * Blockchain
   */
  blockchain: BlockchainCode;
  /**
   * Used assigned label
   */
  label?: string;
  /**
   * Timestamp when the meta was assigned by user
   */
  timestamp: Date;
  /**
   * Transaction ID aka Hash
   */
  txId: string;
}

export interface TxMeta {
  /**
   * Read meta for a transaction
   */
  get(blockchain: BlockchainCode, txid: string): Promise<TxMetaItem | null>;
  /**
   * Persist the meta. If an existing meta has an older timestamp get replaced with new, otherwise it keeps it as is
   * (i.e. always the newest meta)
   *
   * @return the most up-to-date meta, which may be just provided or an existing one
   */
  set(meta: TxMetaItem): Promise<TxMetaItem>;
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

/**
 * Addressbook Item details
 */
export interface AddressbookItem {
  address: {
    type: 'plain' | 'xpub';
    address: Address | XPub;
    currentAddress?: string | undefined;
  };
  blockchain: number;
  createTimestamp?: Date | undefined;
  id?: string | undefined;
  label?: string | undefined;
  updateTimestamp?: Date | undefined;
}

export interface Addressbook {
  /**
   * Add or update existing transaction in the storage
   */
  add(item: AddressbookItem): Promise<string>;
  /**
   * Get address book item by id
   */
  get(id: string): Promise<AddressbookItem | null>;
  /**
   * Remove an item from the address book
   */
  remove(id: string): Promise<void>;
  /**
   * Find address book items under the specified criteria
   */
  query(filter?: AddressbookFilter, query?: PageQuery): Promise<PageResult<AddressbookItem>>;
  /**
   * Update and existing address book item with new values. Currently, it accepts to update only the label and
   * description
   *
   * @param id id of the existing address book
   * @param item updated fields
   */
  update(id: string, item: Partial<AddressbookItem>): Promise<boolean>;
}

export interface XPubPosition {
  /**
   * Get next position at the xpub
   */
  getNext(xpub: XPub): Promise<number>;
  /**
   * Set the current minimum position for the specified xpub. If the storage knows a larger position it stays on
   * that position, otherwise moves up to the specified.
   *
   * NOTE: It's the next position. I.e., if we have xpub with used address at position N and want to use then next
   * address then set it as N+1 here.
   */
  setNextAddressAtLeast(xpub: XPub, pos: number): Promise<void>;
  /**
   * Set the current known position for the specified xpub. If the storage knows a larger position it stays on
   * that position, otherwise moves up to the specified.
   */
  setCurrentAddressAt(xpub: XPub, pos: number): Promise<void>;
}

/**
 * Cached balance value
 */
export interface Balance {
  /**
   * Address
   */
  address: Address;
  /**
   * Amount encoded as a string
   */
  amount: string;
  /**
   * Asset (ETHER, BTC, or a ERC20 code)
   */
  asset: string;
  /**
   * BLockchain with balance
   */
  blockchain: number;
  /**
   * Timestamp when it was cached. Set automatically when added to the persistent state.
   */
  timestamp?: Date | undefined;
}

/**
 * Manage current cached balances
 */
export interface Balances {
  /**
   * List all balances per address or xpub
   * @param address address or xpub
   */
  list(address: Address | XPub): Promise<Balance[]>;
  /**
   * Remember a balance
   * @param balance current value
   */
  set(balance: Balance): Promise<boolean>;
}

export interface PersistentState {
  /**
   * Manager Address Book
   */
  addressbook: Addressbook;
  /**
   * Manage current balance cache
   */
  balances: Balances;
  /**
   * Manage Transaction History
   */
  txhistory: TxHistory;
  /**
   * Manage Transaction Meta
   */
  txmeta: TxMeta;
  /**
   * Manage XPub position
   */
  xpubpos: XPubPosition;
}
