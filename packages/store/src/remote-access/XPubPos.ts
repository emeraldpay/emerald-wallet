import { Commands, PersistentState } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

class XPubPos implements PersistentState.XPubPosition {
  getNext(xpub: string): Promise<number> {
    return ipcRenderer.invoke(Commands.XPUB_POSITION_GET_NEXT, xpub);
  }

  setNextAddressAtLeast(xpub: string, pos: number): Promise<void> {
    return ipcRenderer.invoke(Commands.XPUB_POSITION_NEXT_SET, xpub, pos);
  }

  setCurrentAddressAt(xpub: string, pos: number): Promise<void> {
    return ipcRenderer.invoke(Commands.XPUB_POSITION_SET, xpub, pos);
  }
}

export const RemoteXPubPosition = new XPubPos();
