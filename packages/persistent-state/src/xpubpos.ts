import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { PersistentState } from '@emeraldwallet/core';
import { PersistentStateImpl } from './api';

/**
 * Manage XPub Position
 */
export class XPubPositionImpl implements PersistentState.XPubPosition {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  getNext(xpub: string): Promise<number> {
    return neonFrameHandlerCall(this.manager.addon, 'xpubpos_get_next', [xpub]);
  }

  setNextAddressAtLeast(xpub: string, pos: number): Promise<void> {
    return this.setCurrentAddressAt(xpub, pos - 1);
  }

  setCurrentAddressAt(xpub: string, pos: number): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'xpubpos_set_current', [xpub, pos]);
  }
}
