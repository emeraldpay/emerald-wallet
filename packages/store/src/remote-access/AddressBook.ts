import { Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class AddressBook implements PersistentState.Addressbook {
  add(item: PersistentState.AddressbookItem): Promise<string> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_ADD, item);
  }

  get(id: string): Promise<PersistentState.AddressbookItem | null> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_GET, id);
  }

  remove(id: string): Promise<void> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_REMOVE, id);
  }

  query(
    filter?: PersistentState.AddressbookFilter | undefined,
  ): Promise<PersistentState.PageResult<PersistentState.AddressbookItem>> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_QUERY, filter);
  }

  update(id: string, item: Partial<PersistentState.AddressbookItem>): Promise<boolean> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_UPDATE, id, item);
  }
}

export const RemoteAddressBook = new AddressBook();
