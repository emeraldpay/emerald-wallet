import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { PersistentState } from '@emeraldwallet/core';
import { PersistentStateManager, createDateReviver } from './api';

export class Addressbook implements PersistentState.Addressbook {
  private manager: PersistentStateManager;

  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }

  add(item: PersistentState.AddressbookItem): Promise<string> {
    return neonFrameHandlerCall(this.manager.addon, 'addressbook_add', [JSON.stringify(item)]);
  }

  get(id: string): Promise<PersistentState.AddressbookItem | null> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'addressbook_get',
      [id],
      createDateReviver(['createTimestamp', 'updateTimestamp']),
    );
  }

  remove(id: string): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'addressbook_remove', [id]);
  }

  query(
    filter?: PersistentState.AddressbookFilter,
    page?: PersistentState.PageQuery,
  ): Promise<PersistentState.PageResult<PersistentState.AddressbookItem>> {
    return neonFrameHandlerCall(
      this.manager.addon,
      'addressbook_query',
      [JSON.stringify(filter), JSON.stringify(page)],
      createDateReviver(['createTimestamp', 'updateTimestamp']),
    );
  }

  update(id: string, item: Partial<PersistentState.AddressbookItem>): Promise<boolean> {
    return neonFrameHandlerCall(this.manager.addon, 'addressbook_update', [id, JSON.stringify(item)]);
  }
}
