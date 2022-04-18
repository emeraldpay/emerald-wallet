import {PersistentStateImpl, neonToPromise} from "./api";
import {PersistentState} from "@emeraldwallet/core";

/**
 * Manage XPub Position
 */
export class XPubPositionImpl implements PersistentState.XPubPosition {
  private manager: PersistentStateImpl;

  constructor(manager: PersistentStateImpl) {
    this.manager = manager;
  }

  get(xpub: String): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.xpubpos_get(
          xpub,
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

  set_at_least(xpub: String, pos: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.xpubpos_set(
          xpub, pos,
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

}
