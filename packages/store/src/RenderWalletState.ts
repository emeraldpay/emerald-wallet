import {WalletStateStorage} from "@emeraldwallet/core";
import {WalletState, EntryId, AddressRole} from "@emeraldpay/emerald-vault-core";
import {ipcRenderer} from "electron";

const PREFIX = "walletState/";

export class RenderWalletState implements WalletStateStorage {

  load(): Promise<WalletState> {
    return ipcRenderer.invoke(PREFIX + "load");
  }

  update(entryId: EntryId, receive: number | undefined, change: number | undefined): Promise<WalletState | undefined> {
    return ipcRenderer.invoke(PREFIX + "update", entryId, receive, change);
  }

  next(entryId: EntryId, type: AddressRole): Promise<WalletState> {
    return ipcRenderer.invoke(PREFIX + "next", entryId, type);
  }

}