import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import { PersistentStateManager, createDateReviver } from './api';

export class TxMeta implements PersistentState.TxMeta {
  private manager: PersistentStateManager;

  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }

  get(blockchain: BlockchainCode, txid: string): Promise<PersistentState.TxMetaItem | null> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'txmeta_get',
      [blockchainCodeToId(blockchain), txid],
      createDateReviver(['timestamp']),
    );
  }

  set(meta: PersistentState.TxMetaItem): Promise<PersistentState.TxMetaItem> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'txmeta_set',
      [JSON.stringify(meta)],
      createDateReviver(['timestamp']),
    );
  }
}
