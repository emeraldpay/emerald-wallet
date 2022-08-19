import { Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class AddressBook implements PersistentState.Addressbook {
  add(item: PersistentState.AddressbookItem): Promise<string> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_ADD, item);
  }

  remove(id: string): Promise<void> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_REMOVE, id);
  }

  query(
    filter?: PersistentState.AddressbookFilter | undefined,
  ): Promise<PersistentState.PageResult<PersistentState.AddressbookItem>> {
    return ipcRenderer.invoke(Commands.ADDRESS_BOOK_QUERY, filter);
  }
}

export const RemoteAddressBook = new AddressBook();
