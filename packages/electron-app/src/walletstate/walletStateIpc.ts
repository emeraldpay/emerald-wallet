import {ipcMain} from "electron";
import {WalletStateStorage} from "@emeraldwallet/core";
import {EntryId, AddressRole} from "@emeraldpay/emerald-vault-core";

const PREFIX = "walletState/";

export function mapWalletStateWithIpc(storage: WalletStateStorage) {

  ipcMain.handle(PREFIX + "load", (event) => {
    return storage.load();
  });

  ipcMain.handle(PREFIX + "update", (event, entryId: EntryId, receive: number | undefined, change: number | undefined) => {
    return storage.update(entryId, receive, change);
  });

  ipcMain.handle(PREFIX + "next", (event, entryId: EntryId, type: AddressRole) => {
    return storage.next(entryId, type);
  });

}