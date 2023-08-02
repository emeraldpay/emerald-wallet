import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { PersistentState } from '@emeraldwallet/core';
import { PersistentStateManager } from './api';
import {Uuid} from "@emeraldpay/emerald-vault-core";

export class Allowances implements PersistentState.Allowances {
  private manager: PersistentStateManager;

  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }

  add(wallet_id: Uuid, item: PersistentState.CachedAllowance, ttl?: number): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'allowances_add', [wallet_id, JSON.stringify(item), ttl]);
  }

  list(wallet_id?: Uuid): Promise<PersistentState.PageResult<PersistentState.CachedAllowance>> {
    return neonFrameHandlerCall(this.manager.addon, 'allowances_list', [wallet_id]);
  }

}
