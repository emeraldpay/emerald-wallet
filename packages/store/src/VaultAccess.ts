import {
  AddEntry,
  AddressBookItem,
  AddressRole,
  BlockchainType,
  CreateAddressBookItem,
  CurrentAddress,
  EntryId,
  IEmeraldVault,
  LedgerSeedReference,
  SeedDefinition,
  SeedDescription,
  SeedReference,
  UnsignedTx,
  Uuid,
  Wallet,
  WalletState
} from "@emeraldpay/emerald-vault-core";

import {ipcRenderer} from 'electron';
import {HWKeyDetails} from "@emeraldpay/emerald-vault-core/lib/types";


const PREFIX = "vault/";

class VaultAccess implements IEmeraldVault {
  addEntry(walletId: Uuid, entry: AddEntry): Promise<EntryId> {
    return ipcRenderer.invoke(PREFIX + "addEntry", walletId, entry);
  }

  addToAddressBook(item: CreateAddressBookItem): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "addToAddressBook", item);
  }

  addWallet(label: string | undefined): Promise<Uuid> {
    return ipcRenderer.invoke(PREFIX + "addWallet", label);
  }

  exportJsonPk(entryId: EntryId, password?: string): Promise<string> {
    return ipcRenderer.invoke(PREFIX + "exportJsonPk", entryId, password);
  }

  exportRawPk(entryId: EntryId, password: string): Promise<string> {
    return ipcRenderer.invoke(PREFIX + "exportRawPk", entryId, password);
  }

  generateMnemonic(size: number): Promise<string> {
    return ipcRenderer.invoke(PREFIX + "generateMnemonic", size);
  }

  getConnectedHWDetails(): Promise<HWKeyDetails[]> {
    return ipcRenderer.invoke(PREFIX + "getConnectedHWDetails");
  }

  listEntryAddresses(id: EntryId, role: AddressRole, start: number, limit: number): Promise<CurrentAddress[]> {
    return ipcRenderer.invoke(PREFIX + "listEntryAddresses", id, role, start);
  }

  getWallet(id: Uuid): Promise<Wallet | undefined> {
    return ipcRenderer.invoke(PREFIX + "getWallet", id);
  }

  importSeed(seed: SeedDefinition | LedgerSeedReference): Promise<Uuid> {
    return ipcRenderer.invoke(PREFIX + "importSeed", seed);
  }

  isSeedAvailable(seed: Uuid | SeedReference | SeedDefinition): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "isSeedAvailable", seed);
  }

  listAddressBook(blockchain: number): Promise<AddressBookItem[]> {
    return ipcRenderer.invoke(PREFIX + "listAddressBook", blockchain);
  }

  listSeedAddresses(seed: Uuid | SeedReference | SeedDefinition, blockchain: number, hdpath: string[]): Promise<{ [p: string]: string }> {
    return ipcRenderer.invoke(PREFIX + "listSeedAddresses", seed, blockchain, hdpath);
  }

  listSeeds(): Promise<SeedDescription[]> {
    return ipcRenderer.invoke(PREFIX + "listSeeds");
  }

  listWallets(): Promise<Wallet[]> {
    return ipcRenderer.invoke(PREFIX + "listWallets");
  }

  removeEntry(entryId: EntryId): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "removeEntry", entryId);
  }

  removeFromAddressBook(blockchain: number, address: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "removeFromAddressBook", blockchain, address);
  }

  removeWallet(walletId: Uuid): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "removeWallet", walletId);
  }

  setEntryLabel(entryFullId: EntryId, label: string | null): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "setEntryLabel", entryFullId, label);
  }

  setEntryReceiveDisabled(entryFullId: EntryId, disabled: boolean): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "setEntryReceiveDisabled", entryFullId, disabled);
  }

  setState(state: WalletState): Promise<void> {
    // NOTE: the state is set on the backend from LocalWalletState, this client method is not supposed to be used directly
    // return ipcRenderer.invoke(PREFIX + "setState", state);
    console.warn("The wallet state must be set on the backend");
    return Promise.resolve()
  }

  setWalletLabel(walletId: Uuid, label: string): Promise<boolean> {
    return ipcRenderer.invoke(PREFIX + "setWalletLabel", walletId, label);
  }

  signTx(entryId: EntryId, tx: UnsignedTx, password?: string): Promise<string> {
    return ipcRenderer.invoke(PREFIX + "signTx", entryId, tx, password);
  }

  vaultVersion(): string {
    return "NOTSET";
  }
}

export const RemoteVault = new VaultAccess()