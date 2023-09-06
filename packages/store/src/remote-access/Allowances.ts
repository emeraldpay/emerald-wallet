import { Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, IpcCommands, PersistentState } from '@emeraldwallet/core';
import { CachedAllowance, PageResult } from '@emeraldwallet/core/lib/persistentState';
import { ipcRenderer } from 'electron';

class Allowances implements PersistentState.Allowances {
  add(walletId: Uuid, allowance: CachedAllowance, ttl?: number): Promise<void> {
    return ipcRenderer.invoke(IpcCommands.ALLOWANCES_ADD, walletId, allowance, ttl);
  }

  list(walletId?: Uuid): Promise<PageResult<CachedAllowance>> {
    return ipcRenderer.invoke(IpcCommands.ALLOWANCES_LIST, walletId);
  }

  remove(walletId: Uuid, blockchain?: BlockchainCode, timestamp?: number): Promise<number> {
    return ipcRenderer.invoke(IpcCommands.ALLOWANCES_REMOVE, walletId, blockchain, timestamp);
  }
}

export const RemoteAllowances = new Allowances();
