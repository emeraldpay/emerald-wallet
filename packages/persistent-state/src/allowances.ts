import { Uuid } from '@emeraldpay/emerald-vault-core';
import { neonFrameHandlerCall } from '@emeraldpay/neon-frame';
import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { PersistentStateManager } from './api';

export class Allowances implements PersistentState.Allowances {
  private manager: PersistentStateManager;

  constructor(manager: PersistentStateManager) {
    this.manager = manager;
  }

  add(wallet_id: Uuid, allowance: PersistentState.CachedAllowance, ttl?: number): Promise<void> {
    return neonFrameHandlerCall(this.manager.addon, 'allowances_add', [wallet_id, JSON.stringify(allowance), ttl]);
  }

  list(wallet_id?: Uuid): Promise<PersistentState.PageResult<PersistentState.CachedAllowance>> {
    return neonFrameHandlerCall(this.manager.addon, 'allowances_list', [wallet_id]);
  }

  remove(wallet_id: Uuid, blockchain?: BlockchainCode, min_ts?: number): Promise<number> {
    return neonFrameHandlerCall(this.manager.addon, 'allowances_remove', [wallet_id, blockchain, min_ts]);
  }
}
