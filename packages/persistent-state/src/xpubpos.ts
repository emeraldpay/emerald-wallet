import {PersistentState} from "@emeraldwallet/core";
import {PersistentStateImpl, neonToPromise} from "./api";

/**
 * Manage XPub Position
 */
export class XPubPositionImpl implements PersistentState.XPubPosition {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  getNext(xpub: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.xpubpos_get_next(
          xpub,
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

  setNextAddressAtLeast(xpub: string, pos: number): Promise<void> {
    return this.setCurrentAddressAt(xpub, pos - 1);
  }

  setCurrentAddressAt(xpub: string, pos: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.xpubpos_set_current(
          xpub, pos,
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

}
