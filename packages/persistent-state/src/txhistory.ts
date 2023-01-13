import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { PersistentState } from '@emeraldwallet/core';
import { PersistentStateManager, createDateReviver } from './api';

/**
 * Manage Transaction History
 */
export class TxHistory implements PersistentState.TxHistory {
  private manager: PersistentStateManager;

  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }

  getCursor(target: string): Promise<string | null> {
    return neonFrameHandlerCall(this.manager.addon, 'txhistory_get_cursor', [target]);
  }

  setCursor(target: string, cursor: string): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'txhistory_set_cursor', [target, cursor]);
  }

  remove(blockchain: number, txid: string): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'txhistory_remove', [blockchain, txid]);
  }

  submit(tx: PersistentState.Transaction): Promise<PersistentState.Transaction> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'txhistory_submit',
      [JSON.stringify(tx)],
      createDateReviver(['sinceTimestamp', 'confirmTimestamp']),
    );
  }

  query(
    filter?: PersistentState.TxHistoryFilter,
    page?: PersistentState.PageQuery,
  ): Promise<PersistentState.PageResult<PersistentState.Transaction>> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'txhistory_query',
      [JSON.stringify(filter), JSON.stringify(page)],
      createDateReviver(['sinceTimestamp', 'confirmTimestamp', 'block.timestamp']),
    );
  }
}
