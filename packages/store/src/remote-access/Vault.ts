import {
  AddEntry,
  AddressBookItem,
  AddressRole,
  CurrentAddress,
  EntryId,
  ExportedWeb3Json,
  HWKeyDetails,
  IEmeraldVault,
  IdSeedReference,
  LedgerSeedReference,
  OddPasswordItem,
  SeedDefinition,
  SeedDescription,
  SeedDetails,
  SeedReference,
  SignedTx,
  UnsignedTx,
  Uuid,
  Wallet,
} from '@emeraldpay/emerald-vault-core';
import { IpcCommands } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

const PREFIX = 'vault/';

class Vault implements IEmeraldVault {
  addEntry(walletId: Uuid, entry: AddEntry): Promise<EntryId> {
    return ipcRenderer.invoke(IpcCommands.VAULT_ADD_ENTRY, walletId, entry);
  }

  addWallet(label: string | undefined): Promise<Uuid> {
    return ipcRenderer.invoke(IpcCommands.VAULT_ADD_WALLET, label);
  }

  exportJsonPk(entryId: EntryId, password: string): Promise<ExportedWeb3Json> {
    return ipcRenderer.invoke(IpcCommands.VAULT_EXPORT_JSON_PK, entryId, password);
  }

  exportRawPk(entryId: EntryId, password: string): Promise<string> {
    return ipcRenderer.invoke(IpcCommands.VAULT_EXPORT_RAW_PK, entryId, password);
  }

  generateMnemonic(size: number): Promise<string> {
    return ipcRenderer.invoke(IpcCommands.VAULT_GENERATE_MNEMONIC, size);
  }

  getConnectedHWDetails(): Promise<HWKeyDetails[]> {
    return ipcRenderer.invoke(IpcCommands.VAULT_GET_CONNECTED_HWDETAILS);
  }

  listEntryAddresses(id: EntryId, role: AddressRole, start: number, limit: number): Promise<CurrentAddress[]> {
    return ipcRenderer.invoke(IpcCommands.VAULT_LIST_ENTRY_ADDRESSES, id, role, start, limit);
  }

  getWallet(id: Uuid): Promise<Wallet | undefined> {
    return ipcRenderer.invoke(IpcCommands.VAULT_GET_WALLET, id);
  }

  importSeed(seed: SeedDefinition | LedgerSeedReference): Promise<Uuid> {
    return ipcRenderer.invoke(IpcCommands.VAULT_IMPORT_SEED, seed);
  }

  isSeedAvailable(seed: Uuid | SeedReference | SeedDefinition): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_IS_SEED_AVAILABLE, seed);
  }

  listAddressBook(blockchain: number): Promise<AddressBookItem[]> {
    return ipcRenderer.invoke(IpcCommands.VAULT_LIST_ADDRESS_BOOK, blockchain);
  }

  listSeedAddresses(
    seed: Uuid | SeedReference | SeedDefinition,
    blockchain: number,
    hdpath: string[],
  ): Promise<{ [p: string]: string }> {
    return ipcRenderer.invoke(IpcCommands.VAULT_LIST_SEED_ADDRESSES, seed, blockchain, hdpath);
  }

  listSeeds(): Promise<SeedDescription[]> {
    return ipcRenderer.invoke(IpcCommands.VAULT_LIST_SEEDS);
  }

  listWallets(): Promise<Wallet[]> {
    return ipcRenderer.invoke(IpcCommands.VAULT_LIST_WALLETS);
  }

  removeEntry(entryId: EntryId): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_REMOVE_ENTRY, entryId);
  }

  removeFromAddressBook(blockchain: number, address: string): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_REMOVE_FROM_ADDRESS_BOOK, blockchain, address);
  }

  removeWallet(walletId: Uuid): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_REMOVE_WALLET, walletId);
  }

  setEntryLabel(entryFullId: EntryId, label: string | null): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_SET_ENTRY_LABEL, entryFullId, label);
  }

  setEntryReceiveDisabled(entryFullId: EntryId, disabled: boolean): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_SET_ENTRY_RECEIVE_DISABLED, entryFullId, disabled);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setState(/* state: WalletState */): Promise<void> {
    // NOTE The state is set on the backend from LocalWalletState,
    // this client method is not supposed to be used directly
    console.warn('The wallet state must be set on the backend');

    return Promise.resolve();
  }

  async setWalletLabel(walletId: Uuid, label: string): Promise<boolean> {
    await ipcRenderer.invoke(IpcCommands.VAULT_UPDATE_MAIN_MENU);

    return ipcRenderer.invoke(IpcCommands.VAULT_SET_WALLET_LABEL, walletId, label);
  }

  signTx(entryId: EntryId, tx: UnsignedTx, password?: string): Promise<SignedTx> {
    return ipcRenderer.invoke(IpcCommands.VAULT_SIGN_TX, entryId, tx, password);
  }

  vaultVersion(): string {
    return 'NOTSET';
  }

  createGlobalKey(password: string): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_CREATE_GLOBAL_KEY, password);
  }

  getOddPasswordItems(): Promise<OddPasswordItem[]> {
    return ipcRenderer.invoke(IpcCommands.VAULT_GET_ODD_PASSWORD_ITEMS);
  }

  isGlobalKeySet(): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_IS_GLOBAL_KEY_SET);
  }

  tryUpgradeOddItems(oddPassword: string, globalPassword: string): Promise<Uuid[]> {
    return ipcRenderer.invoke(IpcCommands.VAULT_TRY_UPGRADE_ODD_ITEMS, oddPassword, globalPassword);
  }

  verifyGlobalKey(password: string): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_VERIFY_GLOBAL_KEY, password);
  }

  changeGlobalKey(oldPassword: string, newPassword: string): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_CHANGE_GLOBAL_KEY, oldPassword, newPassword);
  }

  snapshotCreate(targetFile: string): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_SNAPSHOT_CREATE, targetFile);
  }

  snapshotRestore(sourceFile: string, password: string): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_SNAPSHOT_RESTORE, sourceFile, password);
  }

  updateSeed(seed: Uuid | IdSeedReference, details: Partial<SeedDetails>): Promise<boolean> {
    return ipcRenderer.invoke(IpcCommands.VAULT_UPDATE_SEED, seed, details);
  }
}

export const RemoteVault = new Vault();
