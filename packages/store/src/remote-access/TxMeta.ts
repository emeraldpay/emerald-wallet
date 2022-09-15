import { BlockchainCode, Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class TxMeta implements PersistentState.TxMetaStore {
  get(blockchain: BlockchainCode, txid: string): Promise<PersistentState.TxMeta | null> {
    return ipcRenderer.invoke(Commands.GET_TX_META, blockchain, txid);
  }

  set(meta: PersistentState.TxMeta): Promise<PersistentState.TxMeta> {
    return ipcRenderer.invoke(Commands.SET_TX_META, meta);
  }
}

export const RemoteTxMeta = new TxMeta();
