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
  ipcMain.handle(IpcCommands.VAULT_ADD_ENTRY, (event, walletId: Uuid, entry: AddEntry) =>
    vault.addEntry(walletId, entry),
  );

  ipcMain.handle(IpcCommands.VAULT_ADD_WALLET, (event, label: string | undefined) => vault.addWallet(label));

  ipcMain.handle(IpcCommands.VAULT_CHANGE_GLOBAL_KEY, (event, oldPassword, newPassword) =>
    vault.changeGlobalKey(oldPassword, newPassword),
  );

  ipcMain.handle(IpcCommands.VAULT_CREATE_GLOBAL_KEY, (event, password) => vault.createGlobalKey(password));

  ipcMain.handle(IpcCommands.VAULT_EXPORT_JSON_PK, (event, entryId: EntryId, password: string) =>
    vault.exportJsonPk(entryId, password),
  );

  ipcMain.handle(IpcCommands.VAULT_EXPORT_RAW_PK, (event, entryId: EntryId, password: string) =>
    vault.exportRawPk(entryId, password),
  );

  ipcMain.handle(IpcCommands.VAULT_EXTRACT_SIGNER, (event, message: UnsignedMessage, signature: string) =>
    vault.extractMessageSigner(message, signature),
  );

  ipcMain.handle(IpcCommands.VAULT_GENERATE_MNEMONIC, (event, size: number) => vault.generateMnemonic(size));

  ipcMain.handle(IpcCommands.VAULT_GET_CONNECTED_HWDETAILS, () => vault.getConnectedHWDetails());

  ipcMain.handle(IpcCommands.VAULT_GET_ICON, (event, walletId: Uuid) => vault.getIcon(walletId));

  ipcMain.handle(IpcCommands.VAULT_GET_ODD_PASSWORD_ITEMS, () => vault.getOddPasswordItems());

  ipcMain.handle(IpcCommands.VAULT_GET_WALLET, (event, id: Uuid) => vault.getWallet(id));

  ipcMain.handle(IpcCommands.VAULT_IMPORT_SEED, (event, seed: SeedDefinition | LedgerSeedReference) =>
    vault.importSeed(seed),
  );

  ipcMain.handle(IpcCommands.VAULT_IS_GLOBAL_KEY_SET, () => vault.isGlobalKeySet());

  ipcMain.handle(IpcCommands.VAULT_IS_SEED_AVAILABLE, (event, seed: Uuid | SeedReference | SeedDefinition) =>
    vault.isSeedAvailable(seed),
  );

  ipcMain.handle(IpcCommands.VAULT_LIST_ADDRESS_BOOK, (event, blockchain: number) => vault.listAddressBook(blockchain));

  ipcMain.handle(
    IpcCommands.VAULT_LIST_ENTRY_ADDRESSES,
    (event, id: EntryId, role: AddressRole, start: number, limit: number) =>
      vault.listEntryAddresses(id, role, start, limit),
  );

  ipcMain.handle(IpcCommands.VAULT_LIST_ICONS, () => vault.iconsList());

  ipcMain.handle(IpcCommands.VAULT_LIST_SEEDS, () => vault.listSeeds());

  ipcMain.handle(
    IpcCommands.VAULT_LIST_SEED_ADDRESSES,
    (event, seed: Uuid | SeedReference | SeedDefinition, blockchain: number, hdpath: string[]) =>
      vault.listSeedAddresses(seed, blockchain, hdpath),
  );

  ipcMain.handle(IpcCommands.VAULT_LIST_WALLETS, () => vault.listWallets());

  ipcMain.handle(IpcCommands.VAULT_REMOVE_ENTRY, (event, entryId: EntryId) => vault.removeEntry(entryId));

  ipcMain.handle(IpcCommands.VAULT_REMOVE_FROM_ADDRESS_BOOK, (event, blockchain: number, address: string) =>
    vault.removeFromAddressBook(blockchain, address),
  );

  ipcMain.handle(IpcCommands.VAULT_REMOVE_WALLET, (event, walletId: Uuid) => vault.removeWallet(walletId));

  ipcMain.handle(IpcCommands.VAULT_SET_ENTRY_LABEL, (event, entryFullId: EntryId, label: string | null) =>
    vault.setEntryLabel(entryFullId, label),
  );

  ipcMain.handle(IpcCommands.VAULT_SET_ENTRY_RECEIVE_DISABLED, (event, entryFullId: EntryId, disabled: boolean) =>
    vault.setEntryReceiveDisabled(entryFullId, disabled),
  );

  ipcMain.handle(IpcCommands.VAULT_SET_ICON, (event, walletId: Uuid, icon: ArrayBuffer | Uint8Array | null) =>
    vault.setIcon(walletId, icon),
  );

  ipcMain.handle(IpcCommands.VAULT_SET_STATE, (event, state: WalletState) => vault.setState(state));

  ipcMain.handle(IpcCommands.VAULT_SET_WALLET_LABEL, (event, walletId: Uuid, label: string) =>
    vault.setWalletLabel(walletId, label),
  );

  ipcMain.handle(
    IpcCommands.VAULT_SIGN_MESSAGE,
    (event, entryId: EntryId, message: UnsignedMessage, password?: string) =>
      vault.signMessage(entryId, message, password),
  );

  ipcMain.handle(IpcCommands.VAULT_SIGN_TX, (event, entryId: EntryId, tx: UnsignedTx, password?: string) =>
    vault.signTx(entryId, tx, password),
  );

  ipcMain.handle(IpcCommands.VAULT_SNAPSHOT_CREATE, (event, targetFile) => vault.snapshotCreate(targetFile));

  ipcMain.handle(IpcCommands.VAULT_SNAPSHOT_RESTORE, (event, sourceFile, password) =>
    vault.snapshotRestore(sourceFile, password),
  );

  ipcMain.handle(IpcCommands.VAULT_TRY_UPGRADE_ODD_ITEMS, (event, oddPassword, globalPassword) =>
    vault.tryUpgradeOddItems(oddPassword, globalPassword),
  );

  ipcMain.handle(IpcCommands.VAULT_UPDATE_SEED, (event, seed, details) => vault.updateSeed(seed, details));

  ipcMain.handle(IpcCommands.VAULT_VERIFY_GLOBAL_KEY, (event, password) => vault.verifyGlobalKey(password));

  ipcMain.handle(IpcCommands.VAULT_WATCH, (event, request) => vault.watch(request));
}
