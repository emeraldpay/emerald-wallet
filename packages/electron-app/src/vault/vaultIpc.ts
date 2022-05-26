import {
  AddEntry,
  AddressRole,
  CreateAddressBookItem,
  EntryId,
  IEmeraldVault,
  LedgerSeedReference,
  SeedDefinition,
  SeedReference,
  UnsignedTx,
  Uuid,
  WalletState,
} from '@emeraldpay/emerald-vault-core';
import { ipcMain } from 'electron';

const PREFIX = 'vault/';

export function mapVaultWithIpc(vault: IEmeraldVault): void {
  ipcMain.handle(PREFIX + 'setState', (event, state: WalletState) => {
    return vault.setState(state);
  });

  ipcMain.handle(PREFIX + 'listWallets', () => {
    return vault.listWallets();
  });

  ipcMain.handle(PREFIX + 'getWallet', (event, id: Uuid) => {
    return vault.getWallet(id);
  });

  ipcMain.handle(PREFIX + 'addWallet', (event, label: string | undefined) => {
    return vault.addWallet(label);
  });

  ipcMain.handle(PREFIX + 'setWalletLabel', (event, walletId: Uuid, label: string) => {
    return vault.setWalletLabel(walletId, label);
  });

  ipcMain.handle(PREFIX + 'removeWallet', (event, walletId: Uuid) => {
    return vault.removeWallet(walletId);
  });

  ipcMain.handle(
    PREFIX + 'listEntryAddresses',
    (event, id: EntryId, role: AddressRole, start: number, limit: number) => {
      return vault.listEntryAddresses(id, role, start, limit);
    },
  );

  ipcMain.handle(PREFIX + 'addEntry', (event, walletId: Uuid, entry: AddEntry) => {
    return vault.addEntry(walletId, entry);
  });

  ipcMain.handle(PREFIX + 'removeEntry', (event, entryId: EntryId) => {
    return vault.removeEntry(entryId);
  });

  ipcMain.handle(PREFIX + 'setEntryLabel', (event, entryFullId: EntryId, label: string | null) => {
    return vault.setEntryLabel(entryFullId, label);
  });

  ipcMain.handle(PREFIX + 'setEntryReceiveDisabled', (event, entryFullId: EntryId, disabled: boolean) => {
    return vault.setEntryReceiveDisabled(entryFullId, disabled);
  });

  ipcMain.handle(PREFIX + 'signTx', (event, entryId: EntryId, tx: UnsignedTx, password?: string) => {
    return vault.signTx(entryId, tx, password);
  });

  ipcMain.handle(PREFIX + 'exportRawPk', (event, entryId: EntryId, password: string) => {
    return vault.exportRawPk(entryId, password);
  });

  ipcMain.handle(PREFIX + 'exportJsonPk', (event, entryId: EntryId, password: string) => {
    return vault.exportJsonPk(entryId, password);
  });

  ipcMain.handle(PREFIX + 'generateMnemonic', (event, size: number) => {
    return vault.generateMnemonic(size);
  });

  ipcMain.handle(PREFIX + 'listAddressBook', (event, blockchain: number) => {
    return vault.listAddressBook(blockchain);
  });

  ipcMain.handle(PREFIX + 'addToAddressBook', (event, item: CreateAddressBookItem) => {
    return vault.addToAddressBook(item);
  });

  ipcMain.handle(PREFIX + 'removeFromAddressBook', (event, blockchain: number, address: string) => {
    return vault.removeFromAddressBook(blockchain, address);
  });

  ipcMain.handle(PREFIX + 'listSeeds', () => {
    return vault.listSeeds();
  });

  ipcMain.handle(PREFIX + 'getConnectedHWDetails', () => {
    return vault.getConnectedHWDetails();
  });

  ipcMain.handle(PREFIX + 'importSeed', (event, seed: SeedDefinition | LedgerSeedReference) => {
    return vault.importSeed(seed);
  });

  ipcMain.handle(PREFIX + 'isSeedAvailable', (event, seed: Uuid | SeedReference | SeedDefinition) => {
    return vault.isSeedAvailable(seed);
  });

  ipcMain.handle(
    PREFIX + 'listSeedAddresses',
    (event, seed: Uuid | SeedReference | SeedDefinition, blockchain: number, hdpath: string[]) => {
      return vault.listSeedAddresses(seed, blockchain, hdpath);
    },
  );

  ipcMain.handle(PREFIX + 'createGlobalKey', (event, password) => {
    return vault.createGlobalKey(password);
  });

  ipcMain.handle(PREFIX + 'getOddPasswordItems', () => {
    return vault.getOddPasswordItems();
  });

  ipcMain.handle(PREFIX + 'isGlobalKeySet', () => {
    return vault.isGlobalKeySet();
  });

  ipcMain.handle(PREFIX + 'tryUpgradeOddItems', (event, oddPassword, globalPassword) => {
    return vault.tryUpgradeOddItems(oddPassword, globalPassword);
  });

  ipcMain.handle(PREFIX + 'verifyGlobalKey', (event, password) => {
    return vault.verifyGlobalKey(password);
  });

  ipcMain.handle(PREFIX + 'changeGlobalKey', (event, oldPassword, newPassword) => {
    return vault.changeGlobalKey(oldPassword, newPassword);
  });

  ipcMain.handle(PREFIX + 'snapshotCreate', (event, targetFile) => {
    return vault.snapshotCreate(targetFile);
  });

  ipcMain.handle(PREFIX + 'snapshotRestore', (event, sourceFile, password) => {
    return vault.snapshotRestore(sourceFile, password);
  });
}
