import { IpcCommands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class Balances implements PersistentState.Balances {
  list(address: PersistentState.Address | PersistentState.XPub): Promise<PersistentState.Balance[]> {
    return ipcRenderer.invoke(IpcCommands.BALANCES_LIST, address);
  }

  set(balance: PersistentState.Balance): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.BALANCES_SET, balance);
  }
}

export const RemoteBalances = new Balances();
