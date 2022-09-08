import { PersistentState } from '@emeraldwallet/core';
import { PersistentStateImpl, createDateReviver, neonToPromise } from './api';

export class AddressbookImpl implements PersistentState.Addressbook {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  add(item: PersistentState.AddressbookItem): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_add(JSON.stringify(item), neonToPromise(resolve, reject));
      } catch (e) {
        reject(e);
      }
    });
  }

  get(id: string): Promise<PersistentState.AddressbookItem | null> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_get(
          id,
          neonToPromise(resolve, reject, createDateReviver(['createTimestamp', 'updateTimestamp'])),
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  remove(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_remove(id, neonToPromise(resolve, reject));
      } catch (e) {
        reject(e);
      }
    });
  }

  query(
    filter?: PersistentState.AddressbookFilter,
    page?: PersistentState.PageQuery,
  ): Promise<PersistentState.PageResult<PersistentState.AddressbookItem>> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_query(
          JSON.stringify(filter),
          JSON.stringify(page),
          neonToPromise(resolve, reject, createDateReviver(['createTimestamp', 'updateTimestamp'])),
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  update(id: string, item: Partial<PersistentState.AddressbookItem>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_update(id, JSON.stringify(item), neonToPromise(resolve, reject));
      } catch (e) {
        reject(e);
      }
    });
  }
}
