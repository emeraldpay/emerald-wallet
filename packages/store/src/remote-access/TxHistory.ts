import { Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class TxHistory implements PersistentState.TxHistory {
  query(
    filter?: PersistentState.TxHistoryFilter,
    query?: PersistentState.PageQuery,
  ): Promise<PersistentState.PageResult<PersistentState.Transaction>> {
    return ipcRenderer.invoke(Commands.LOAD_TX_HISTORY, filter, query);
  }

  remove(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  submit(): Promise<PersistentState.Transaction> {
    throw new Error('Method not implemented.');
  }

  getCursor(): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  setCursor(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export const RemoteTxHistory = new TxHistory();
