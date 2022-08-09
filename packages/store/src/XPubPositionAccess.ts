import { Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class XPubPositionAccess implements PersistentState.XPubPosition {
  get(xpub: string): Promise<number> {
    return ipcRenderer.invoke(Commands.XPUB_POSITION_GET, xpub);
  }

  setAtLeast(xpub: string, pos: number): Promise<void> {
    return ipcRenderer.invoke(Commands.XPUB_POSITION_SET, xpub, pos);
  }
}

export const RemoteXPubPosition = new XPubPositionAccess();
