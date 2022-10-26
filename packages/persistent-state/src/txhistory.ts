import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { PersistentState } from '@emeraldwallet/core';
import { PersistentStateImpl, createDateReviver } from './api';

/**
 * Manage Transaction History
 */
export class TxHistoryImpl implements PersistentState.TxHistory {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  submit(tx: PersistentState.Transaction): Promise<PersistentState.Transaction> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'txhistory_submit',
      [JSON.stringify(tx)],
      createDateReviver(['sinceTimestamp', 'confirmTimestamp']),
    );
  }

  remove(blockchain: number, txid: string): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'txhistory_remove', [blockchain, txid]);
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

  getCursor(target: string): Promise<string | null> {
    return neonFrameHandlerCall(this.manager.addon, 'txhistory_get_cursor', [target]);
  }

  setCursor(target: string, cursor: string): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'txhistory_set_cursor', [target, cursor]);
  }
}
