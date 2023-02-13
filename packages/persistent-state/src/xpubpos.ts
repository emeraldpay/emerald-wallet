import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { PersistentState } from '@emeraldwallet/core';
import { PersistentStateManager } from './api';

/**
 * Manage XPub Position
 */
export class XPubPosition implements PersistentState.XPubPosition {
  private manager: PersistentStateManager;

  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }

  getNext(xpub: string): Promise<number> {
    return neonFrameHandlerCall(this.manager.addon, 'xpubpos_get_next', [xpub]);
  }

  setCurrentAddressAt(xpub: PersistentState.XPub, pos: number): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'xpubpos_set_current', [xpub, pos]);
  }

  setNextAddressAtLeast(xpub: PersistentState.XPub, pos: number): Promise<void> {
    return this.setCurrentAddressAt(xpub, pos - 1);
  }
}
