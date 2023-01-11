import { BlockchainCode, IpcCommands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class TxMeta implements PersistentState.TxMeta {
  get(blockchain: BlockchainCode, txid: string): Promise<PersistentState.TxMetaItem | null> {
    return ipcRenderer.invoke(IpcCommands.GET_TX_META, blockchain, txid);
  }

  set(meta: PersistentState.TxMetaItem): Promise<PersistentState.TxMetaItem> {
    return ipcRenderer.invoke(IpcCommands.SET_TX_META, meta);
  }
}

export const RemoteTxMeta = new TxMeta();
