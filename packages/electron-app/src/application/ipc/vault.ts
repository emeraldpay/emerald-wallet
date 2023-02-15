import {
  AddEntry,
  AddressRole,
  EntryId,
  IEmeraldVault,
  LedgerSeedReference,
  SeedDefinition,
  SeedReference,
  UnsignedMessage,
  UnsignedTx,
  Uuid,
  WalletState,
} from '@emeraldpay/emerald-vault-core';
import { IpcCommands } from '@emeraldwallet/core';
import { ipcMain } from 'electron';

export function setupVaultIpc(vault: IEmeraldVault): void {
  ipcMain.handle(IpcCommands.VAULT_ADD_ENTRY, (event, walletId: Uuid, entry: AddEntry) => {
    return vault.addEntry(walletId, entry);
  });

  ipcMain.handle(IpcCommands.VAULT_ADD_WALLET, (event, label: string | undefined) => {
    return vault.addWallet(label);
  });

  ipcMain.handle(IpcCommands.VAULT_CHANGE_GLOBAL_KEY, (event, oldPassword, newPassword) => {
    return vault.changeGlobalKey(oldPassword, newPassword);
  });

  ipcMain.handle(IpcCommands.VAULT_CREATE_GLOBAL_KEY, (event, password) => {
    return vault.createGlobalKey(password);
  });

  ipcMain.handle(IpcCommands.VAULT_EXPORT_JSON_PK, (event, entryId: EntryId, password: string) => {
    return vault.exportJsonPk(entryId, password);
  });

  ipcMain.handle(IpcCommands.VAULT_EXPORT_RAW_PK, (event, entryId: EntryId, password: string) => {
    return vault.exportRawPk(entryId, password);
  });

  ipcMain.handle(IpcCommands.VAULT_EXTRACT_SIGNER, (event, message: UnsignedMessage, signature: string) => {
    return vault.extractMessageSigner(message, signature);
  });

  ipcMain.handle(IpcCommands.VAULT_GENERATE_MNEMONIC, (event, size: number) => {
    return vault.generateMnemonic(size);
  });

  ipcMain.handle(IpcCommands.VAULT_GET_CONNECTED_HWDETAILS, () => {
    return vault.getConnectedHWDetails();
  });

  ipcMain.handle(IpcCommands.VAULT_GET_ICON, (event, walletId: Uuid) => {
    return vault.getIcon(walletId);
  });

  ipcMain.handle(IpcCommands.VAULT_GET_ODD_PASSWORD_ITEMS, () => {
    return vault.getOddPasswordItems();
  });

  ipcMain.handle(IpcCommands.VAULT_GET_WALLET, (event, id: Uuid) => {
    return vault.getWallet(id);
  });

  ipcMain.handle(IpcCommands.VAULT_IMPORT_SEED, (event, seed: SeedDefinition | LedgerSeedReference) => {
    return vault.importSeed(seed);
  });

  ipcMain.handle(IpcCommands.VAULT_IS_GLOBAL_KEY_SET, () => {
    return vault.isGlobalKeySet();
  });

  ipcMain.handle(IpcCommands.VAULT_IS_SEED_AVAILABLE, (event, seed: Uuid | SeedReference | SeedDefinition) => {
    return vault.isSeedAvailable(seed);
  });

  ipcMain.handle(IpcCommands.VAULT_LIST_ADDRESS_BOOK, (event, blockchain: number) => {
    return vault.listAddressBook(blockchain);
  });

  ipcMain.handle(
    IpcCommands.VAULT_LIST_ENTRY_ADDRESSES,
    (event, id: EntryId, role: AddressRole, start: number, limit: number) => {
      return vault.listEntryAddresses(id, role, start, limit);
    },
  );

  ipcMain.handle(IpcCommands.VAULT_LIST_ICONS, () => {
    return vault.iconsList();
  });

  ipcMain.handle(IpcCommands.VAULT_LIST_SEEDS, () => {
    return vault.listSeeds();
  });

  ipcMain.handle(
    IpcCommands.VAULT_LIST_SEED_ADDRESSES,
    (event, seed: Uuid | SeedReference | SeedDefinition, blockchain: number, hdpath: string[]) => {
      return vault.listSeedAddresses(seed, blockchain, hdpath);
    },
  );

  ipcMain.handle(IpcCommands.VAULT_LIST_WALLETS, () => {
    return vault.listWallets();
  });

  ipcMain.handle(IpcCommands.VAULT_REMOVE_ENTRY, (event, entryId: EntryId) => {
    return vault.removeEntry(entryId);
  });

  ipcMain.handle(IpcCommands.VAULT_REMOVE_FROM_ADDRESS_BOOK, (event, blockchain: number, address: string) => {
    return vault.removeFromAddressBook(blockchain, address);
  });

  ipcMain.handle(IpcCommands.VAULT_REMOVE_WALLET, (event, walletId: Uuid) => {
    return vault.removeWallet(walletId);
  });

  ipcMain.handle(IpcCommands.VAULT_SET_ENTRY_LABEL, (event, entryFullId: EntryId, label: string | null) => {
    return vault.setEntryLabel(entryFullId, label);
  });

  ipcMain.handle(IpcCommands.VAULT_SET_ENTRY_RECEIVE_DISABLED, (event, entryFullId: EntryId, disabled: boolean) => {
    return vault.setEntryReceiveDisabled(entryFullId, disabled);
  });

  ipcMain.handle(IpcCommands.VAULT_SET_ICON, (event, walletId: Uuid, icon: ArrayBuffer | Uint8Array | null) => {
    return vault.setIcon(walletId, icon);
  });

  ipcMain.handle(IpcCommands.VAULT_SET_STATE, (event, state: WalletState) => {
    return vault.setState(state);
  });

  ipcMain.handle(IpcCommands.VAULT_SET_WALLET_LABEL, (event, walletId: Uuid, label: string) => {
    return vault.setWalletLabel(walletId, label);
  });

  ipcMain.handle(
    IpcCommands.VAULT_SIGN_MESSAGE,
    (event, entryId: EntryId, message: UnsignedMessage, password?: string) => {
      return vault.signMessage(entryId, message, password);
    },
  );

  ipcMain.handle(IpcCommands.VAULT_SIGN_TX, (event, entryId: EntryId, tx: UnsignedTx, password?: string) => {
    return vault.signTx(entryId, tx, password);
  });

  ipcMain.handle(IpcCommands.VAULT_SNAPSHOT_CREATE, (event, targetFile) => {
    return vault.snapshotCreate(targetFile);
  });

  ipcMain.handle(IpcCommands.VAULT_SNAPSHOT_RESTORE, (event, sourceFile, password) => {
    return vault.snapshotRestore(sourceFile, password);
  });

  ipcMain.handle(IpcCommands.VAULT_TRY_UPGRADE_ODD_ITEMS, (event, oddPassword, globalPassword) => {
    return vault.tryUpgradeOddItems(oddPassword, globalPassword);
  });

  ipcMain.handle(IpcCommands.VAULT_UPDATE_SEED, (event, seed, details) => {
    return vault.updateSeed(seed, details);
  });

  ipcMain.handle(IpcCommands.VAULT_VERIFY_GLOBAL_KEY, (event, password) => {
    return vault.verifyGlobalKey(password);
  });
}
