import {BlockchainCode, blockchainCodeToId, PersistentState} from '@emeraldwallet/core';
import { createDateReviver, neonToPromise, PersistentStateImpl } from './api';

export class TxMetaStoreImpl implements PersistentState.TxMetaStore {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  set(meta: PersistentState.TxMeta): Promise<PersistentState.TxMeta> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txmeta_set(
          JSON.stringify(meta),
          neonToPromise(resolve, reject, createDateReviver(['timestamp']))
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  get(blockchain: BlockchainCode, txid: string): Promise<PersistentState.TxMeta | null> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.txmeta_get(
          blockchainCodeToId(blockchain), txid,
          neonToPromise(resolve, reject, createDateReviver(['timestamp']))
        );
      } catch (e) {
        reject(e);
      }
    });
  }

}
