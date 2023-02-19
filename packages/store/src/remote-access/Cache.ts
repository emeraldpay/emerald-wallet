import { IpcCommands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class Cache implements PersistentState.Cache {
  evict(id: string): Promise<void> {
    return ipcRenderer.invoke(IpcCommands.CACHE_EVICT, id);
  }

  get(id: string): Promise<string | null> {
    return ipcRenderer.invoke(IpcCommands.CACHE_GET, id);
  }

  put(id: string, value: string, ttl?: number): Promise<void> {
    return ipcRenderer.invoke(IpcCommands.CACHE_PUT, id, value, ttl);
  }
}

export const RemoteCache = new Cache();
