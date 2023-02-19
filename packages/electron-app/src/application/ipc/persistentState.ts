import { BlockchainCode, IpcCommands, PersistentState } from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { ipcMain } from 'electron';

export function setupPersistentStateIpc(persistentState: PersistentStateManager): void {
  ipcMain.handle(IpcCommands.ADDRESS_BOOK_ADD, (event, item: PersistentState.AddressbookItem) =>
    persistentState.addressbook.add(item),
  );

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_GET, (event, id: string) => persistentState.addressbook.get(id));

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_REMOVE, (event, id: string) => persistentState.addressbook.remove(id));

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_QUERY, (event, filter: PersistentState.AddressbookFilter) =>
    persistentState.addressbook.query(filter),
  );

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_UPDATE, (event, id: string, item: Partial<PersistentState.AddressbookItem>) =>
    persistentState.addressbook.update(id, item),
  );

  ipcMain.handle(IpcCommands.BALANCES_LIST, (event, address: PersistentState.Address | PersistentState.XPub) =>
    persistentState.balances.list(address),
  );

  ipcMain.handle(IpcCommands.BALANCES_SET, (event, balance: PersistentState.Balance) =>
    persistentState.balances.set(balance),
  );

  ipcMain.handle(IpcCommands.CACHE_EVICT, (event, id: string) => persistentState.cache.evict(id));

  ipcMain.handle(IpcCommands.CACHE_GET, (event, id: string) => persistentState.cache.get(id));

  ipcMain.handle(IpcCommands.CACHE_PUT, (event, id: string, value: string, ttl?: number) =>
    persistentState.cache.put(id, value, ttl),
  );

  ipcMain.handle(
    IpcCommands.LOAD_TX_HISTORY,
    (event, filter?: PersistentState.TxHistoryFilter, query?: PersistentState.PageQuery) =>
      persistentState.txhistory.query(filter, query),
  );

  ipcMain.handle(IpcCommands.SUBMIT_TX_HISTORY, (event, tx: PersistentState.Transaction) =>
    persistentState.txhistory.submit(tx),
  );

  ipcMain.handle(IpcCommands.GET_TX_META, (event, blockchain: BlockchainCode, txId: string) =>
    persistentState.txmeta.get(blockchain, txId),
  );

  ipcMain.handle(IpcCommands.SET_TX_META, (event, meta: PersistentState.TxMetaItem) =>
    persistentState.txmeta.set(meta),
  );

  ipcMain.handle(IpcCommands.XPUB_POSITION_GET_NEXT, (event, xpub: string) => persistentState.xpubpos.getNext(xpub));

  ipcMain.handle(IpcCommands.XPUB_POSITION_SET, (event, xpub: string, pos: number) =>
    persistentState.xpubpos.setCurrentAddressAt(xpub, pos),
  );

  ipcMain.handle(IpcCommands.XPUB_POSITION_NEXT_SET, (event, xpub: string, pos: number) =>
    persistentState.xpubpos.setNextAddressAtLeast(xpub, pos),
  );
}
