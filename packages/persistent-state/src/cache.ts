import {PersistentState} from "@emeraldwallet/core";
import {PersistentStateManager} from "./api";
import {neonFrameHandlerCall} from "@emeraldpay/neon-frame";

export class Cache implements PersistentState.Cache {
  private manager: PersistentStateManager;

  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }

  evict(id: string): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'cache_evict', [id]);
  }

  get(id: string): Promise<string | null> {
    return neonFrameHandlerCall(this.manager.addon, 'cache_get', [id])
  }

  put(id: string, value: string, ttl_seconds?: number | undefined): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'cache_put', [id, value, ttl_seconds])
  }
}
