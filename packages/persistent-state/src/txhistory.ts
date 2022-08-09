import { PersistentState } from '@emeraldwallet/core';
import { createDateReviver, neonToPromise, PersistentStateImpl } from './api';

/**
 * Manage Transaction History
 */
export class TxHistoryImpl implements PersistentState.TxHistory {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  submit(tx: PersistentState.Transaction): Promise<PersistentState.Transaction> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_submit(
          JSON.stringify(tx),
          neonToPromise(resolve, reject, createDateReviver(['sinceTimestamp', 'confirmTimestamp']))
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  remove(blockchain: number, txid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_remove(blockchain, txid, neonToPromise(resolve, reject));
      } catch (e) {
        reject(e);
      }
    });
  }

  query(filter?: PersistentState.TxHistoryFilter): Promise<PersistentState.PageResult<PersistentState.Transaction>> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_query(
          JSON.stringify(filter),
          neonToPromise(resolve, reject, createDateReviver(['sinceTimestamp', 'confirmTimestamp', 'block.timestamp'])),
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  getCursor(target: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_get_cursor(target, neonToPromise(resolve, reject));
      } catch (e) {
        reject(e);
      }
    });
  }

  setCursor(target: string, cursor: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txhistory_set_cursor(target, cursor, neonToPromise(resolve, reject));
      } catch (e) {
        reject(e);
      }
    });
  }
}
