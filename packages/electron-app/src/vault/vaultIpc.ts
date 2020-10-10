import {ipcMain} from "electron";
import {
  IEmeraldVault,
  WalletState,
  AddressRole,
  EntryId,
  Uuid,
  AddEntry,
  UnsignedTx,
  CreateAddressBookItem,
  SeedDefinition,
  LedgerSeedReference,
  SeedReference
} from "@emeraldpay/emerald-vault-core";

const PREFIX = "vault/";

export function mapVaultWithIpc(vault: IEmeraldVault) {

  ipcMain.handle(PREFIX + "setState", (event, state: WalletState) => {
    return vault.setState(state);
  });
  ipcMain.handle(PREFIX + "listWallets", (event) => {
    return vault.listWallets();
  });
  ipcMain.handle(PREFIX + "getWallet", (event, id: Uuid) => {
    return vault.getWallet(id);
  });
  ipcMain.handle(PREFIX + "addWallet", (event, label: string | undefined) => {
    return vault.addWallet(label);
  });
  ipcMain.handle(PREFIX + "setWalletLabel", (event, walletId: Uuid, label: string) => {
    return vault.setWalletLabel(walletId, label);
  });
  ipcMain.handle(PREFIX + "removeWallet", (event, walletId: Uuid) => {
    return vault.removeWallet(walletId);
  });
  ipcMain.handle(PREFIX + "listEntryAddresses", (event, id: EntryId, role: AddressRole, start: number, limit: number) => {
    return vault.listEntryAddresses(id, role, start, limit);
  });
  ipcMain.handle(PREFIX + "addEntry", (event, walletId: Uuid, entry: AddEntry) => {
    return vault.addEntry(walletId, entry);
  });
  ipcMain.handle(PREFIX + "removeEntry", (event, entryId: EntryId) => {
    return vault.removeEntry(entryId);
  });
  ipcMain.handle(PREFIX + "setEntryLabel", (event, entryFullId: EntryId, label: string | null) => {
    return vault.setEntryLabel(entryFullId, label);
  });
  ipcMain.handle(PREFIX + "setEntryReceiveDisabled", (event, entryFullId: EntryId, disabled: boolean) => {
    return vault.setEntryReceiveDisabled(entryFullId, disabled);
  });
  ipcMain.handle(PREFIX + "signTx", (event, entryId: EntryId, tx: UnsignedTx, password?: string) => {
    return vault.signTx(entryId, tx, password);
  });
  ipcMain.handle(PREFIX + "exportRawPk", (event, entryId: EntryId, password: string) => {
    return vault.exportRawPk(entryId, password);
  });
  ipcMain.handle(PREFIX + "exportJsonPk", (event, entryId: EntryId, password?: string) => {
    return vault.exportJsonPk(entryId, password);
  });
  ipcMain.handle(PREFIX + "generateMnemonic", (event, size: number) => {
    return vault.generateMnemonic(size);
  });
  ipcMain.handle(PREFIX + "listAddressBook", (event, blockchain: number) => {
    return vault.listAddressBook(blockchain);
  });
  ipcMain.handle(PREFIX + "addToAddressBook", (event, item: CreateAddressBookItem) => {
    return vault.addToAddressBook(item);
  });
  ipcMain.handle(PREFIX + "removeFromAddressBook", (event, blockchain: number, address: string) => {
    return vault.removeFromAddressBook(blockchain, address);
  });
  ipcMain.handle(PREFIX + "listSeeds", (event) => {
    return vault.listSeeds();
  });
  ipcMain.handle(PREFIX + "getConnectedHWSeed", (event, create: boolean) => {
    return vault.getConnectedHWSeed(create);
  });
  ipcMain.handle(PREFIX + "importSeed", (event, seed: SeedDefinition | LedgerSeedReference) => {
    return vault.importSeed(seed);
  });
  ipcMain.handle(PREFIX + "isSeedAvailable", (event, seed: Uuid | SeedReference | SeedDefinition) => {
    return vault.isSeedAvailable(seed);
  });
  ipcMain.handle(PREFIX + "listSeedAddresses", (event, seed: Uuid | SeedReference | SeedDefinition, blockchain: number, hdpath: string[]) => {
    return vault.listSeedAddresses(seed, blockchain, hdpath);
  });
}