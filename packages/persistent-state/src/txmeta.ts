import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import { PersistentStateImpl, createDateReviver } from './api';

export class TxMetaStoreImpl implements PersistentState.TxMetaStore {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  set(meta: PersistentState.TxMeta): Promise<PersistentState.TxMeta> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'txmeta_set',
      [JSON.stringify(meta)],
      createDateReviver(['timestamp']),
    );
  }

  get(blockchain: BlockchainCode, txid: string): Promise<PersistentState.TxMeta | null> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'txmeta_get',
      [blockchainCodeToId(blockchain), txid],
      createDateReviver(['timestamp']),
    );
  }
}
