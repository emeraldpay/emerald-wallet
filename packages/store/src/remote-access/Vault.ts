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
  UnsignedTx,
  Uuid,
  Wallet,
} from '@emeraldpay/emerald-vault-core';
import { ipcRenderer } from 'electron';

const PREFIX = 'vault/';

class Vault implements IEmeraldVault {
  addEntry(walletId: Uuid, entry: AddEntry): Promise<EntryId> {
    return ipcRenderer.invoke(PREFIX + 'addEntry', walletId, entry);
  }

  addWallet(label: string | undefined): Promise<Uuid> {
    return ipcRenderer.invoke(PREFIX + 'addWallet', label);
  }

  exportJsonPk(entryId: EntryId, password: string): Promise<ExportedWeb3Json> {
    return ipcRenderer.invoke(PREFIX + 'exportJsonPk', entryId, password);
  }

  exportRawPk(entryId: EntryId, password: string): Promise<string> {
    return ipcRenderer.invoke(PREFIX + 'exportRawPk', entryId, password);
  }

  generateMnemonic(size: number): Promise<string> {
    return ipcRenderer.invoke(PREFIX + 'generateMnemonic', size);
  }

  getConnectedHWDetails(): Promise<HWKeyDetails[]> {
    return ipcRenderer.invoke(PREFIX + 'getConnectedHWDetails');
  }

  listEntryAddresses(id: EntryId, role: AddressRole, start: number, limit: number): Promise<CurrentAddress[]> {
    return ipcRenderer.invoke(PREFIX + 'listEntryAddresses', id, role, start, limit);
  }

  getWallet(id: Uuid): Promise<Wallet | undefined> {
    return ipcRenderer.invoke(PREFIX + 'getWallet', id);
  }

  importSeed(seed: SeedDefinition | LedgerSeedReference): Promise<Uuid> {
    return ipcRenderer.invoke(PREFIX + 'importSeed', seed);
  }

  isSeedAvailable(seed: Uuid | SeedReference | SeedDefinition): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'isSeedAvailable', seed);
  }

  listAddressBook(blockchain: number): Promise<AddressBookItem[]> {
    return ipcRenderer.invoke(PREFIX + 'listAddressBook', blockchain);
  }

  listSeedAddresses(
    seed: Uuid | SeedReference | SeedDefinition,
    blockchain: number,
    hdpath: string[],
  ): Promise<{ [p: string]: string }> {
    return ipcRenderer.invoke(PREFIX + 'listSeedAddresses', seed, blockchain, hdpath);
  }

  listSeeds(): Promise<SeedDescription[]> {
    return ipcRenderer.invoke(PREFIX + 'listSeeds');
  }

  listWallets(): Promise<Wallet[]> {
    return ipcRenderer.invoke(PREFIX + 'listWallets');
  }

  removeEntry(entryId: EntryId): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'removeEntry', entryId);
  }

  removeFromAddressBook(blockchain: number, address: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'removeFromAddressBook', blockchain, address);
  }

  removeWallet(walletId: Uuid): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'removeWallet', walletId);
  }

  setEntryLabel(entryFullId: EntryId, label: string | null): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'setEntryLabel', entryFullId, label);
  }

  setEntryReceiveDisabled(entryFullId: EntryId, disabled: boolean): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'setEntryReceiveDisabled', entryFullId, disabled);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setState(/* state: WalletState */): Promise<void> {
    // NOTE The state is set on the backend from LocalWalletState,
    // this client method is not supposed to be used directly
    console.warn('The wallet state must be set on the backend');

    return Promise.resolve();
    // return ipcRenderer.invoke(PREFIX + "setState", state);
  }

  setWalletLabel(walletId: Uuid, label: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'setWalletLabel', walletId, label);
  }

  signTx(entryId: EntryId, tx: UnsignedTx, password?: string): Promise<string> {
    return ipcRenderer.invoke(PREFIX + 'signTx', entryId, tx, password);
  }

  vaultVersion(): string {
    return 'NOTSET';
  }

  createGlobalKey(password: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'createGlobalKey', password);
  }

  getOddPasswordItems(): Promise<OddPasswordItem[]> {
    return ipcRenderer.invoke(PREFIX + 'getOddPasswordItems');
  }

  isGlobalKeySet(): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'isGlobalKeySet');
  }

  tryUpgradeOddItems(oddPassword: string, globalPassword: string): Promise<Uuid[]> {
    return ipcRenderer.invoke(PREFIX + 'tryUpgradeOddItems', oddPassword, globalPassword);
  }

  verifyGlobalKey(password: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'verifyGlobalKey', password);
  }

  changeGlobalKey(oldPassword: string, newPassword: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'changeGlobalKey', oldPassword, newPassword);
  }

  snapshotCreate(targetFile: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'snapshotCreate', targetFile);
  }

  snapshotRestore(sourceFile: string, password: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'snapshotRestore', sourceFile, password);
  }

  updateSeed(seed: Uuid | IdSeedReference, details: Partial<SeedDetails>): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + 'updateSeed', seed, details);
  }
}

export const RemoteVault = new Vault();
