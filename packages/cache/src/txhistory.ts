import {createDateReviver, EmeraldStateManager, neonToPromise, PageResult} from "./api";
import {Uuid, EntryId} from "@emeraldpay/emerald-vault-core";
import {AnyCoinCode} from "@emeraldwallet/core";

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

export interface Change {
  wallet?: EntryId;
  address?: string;
  hdPath?: string;
  asset: AnyCoinCode;
  /**
   * Amount in the specified asset, represented in the smallest unit (i.e., a SAT, WEI, etc).
   * Note that the amount may be negative value, when transferred _from_ the wallet.
   */
  amount: string;
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
export interface Filter {
  /**
   * Require the specified wallet or its entry
   */
  wallet?: Uuid | EntryId,
  /**
   * require a transaction known or confirmed after the specified moment
   */
  after?: Date,
  /**
   * require a transaction known or confirmed before the specified moment
   */
  before?: Date,
}

/**
 * Manage Transaction History
 */
export class TxHistory {
  private manager: EmeraldStateManager;

  constructor(manager: EmeraldStateManager) {
    this.manager = manager;
  }

  /**
   * Add or update existing transaction in the storage
   * @param tx
   */
  submit(tx: Transaction): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_submit(
          JSON.stringify(tx),
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * Remove transaction from the storage
   * @param blockchain
   * @param txid
   */
  remove(blockchain: number, txid: String): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_remove(
          blockchain, txid,
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * Find transactions under the specified criteria
   * @param filter
   */
  query(filter?: Filter): Promise<PageResult<Transaction>> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_query(
          JSON.stringify(filter),
          neonToPromise(resolve, reject, createDateReviver(["sinceTimestamp", "confirmTimestamp"]))
        );
      } catch (e) {
        reject(e)
      }
    });
  }


}
