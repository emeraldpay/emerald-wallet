import { Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, IpcCommands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class Allowances implements PersistentState.Allowances {
  add(walletId: Uuid, allowance: PersistentState.CachedAllowance, ttl?: number): Promise<void> {
    return ipcRenderer.invoke(IpcCommands.ALLOWANCES_ADD, walletId, allowance, ttl);
  }

  list(walletId?: Uuid): Promise<PersistentState.PageResult<PersistentState.CachedAllowance>> {
    return ipcRenderer.invoke(IpcCommands.ALLOWANCES_LIST, walletId);
  }

  remove(walletId: Uuid, blockchain?: BlockchainCode, timestamp?: number): Promise<number> {
    return ipcRenderer.invoke(IpcCommands.ALLOWANCES_REMOVE, walletId, blockchain, timestamp);
  }
}

export const RemoteAllowances = new Allowances();
