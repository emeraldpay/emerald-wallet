import {
  EntryId,
  AddEntry,
  SeedDefinition,
  SeedDescription,
  UnsignedTx,
  Uuid,
  BlockchainType,
  SeedReference,
  Wallet,
  AddressBookItem
} from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '../blockchains';

export default interface IVault {
  listWallets(): Wallet[];

  addWalletWithSeed(seedId: string, label: string | undefined): Uuid;

  addWallet(label: string | undefined): Uuid;

  getWallet(id: Uuid): Wallet | undefined;

  setWalletLabel(walletId: Uuid, label: string): boolean;

  addEntry(walletId: Uuid, account: AddEntry): EntryId;

  // export account data
  exportJsonPrivateKey(accountFullId: EntryId, password?: string): Promise<string>;

  exportRawPrivateKey(accountFullId: EntryId, password: string): Promise<string>;

  generateMnemonic(size: number): string;

  importSeed(seed: SeedDefinition): Uuid;

  listSeeds(): SeedDescription[];

  isSeedAvailable(seed: Uuid | SeedReference | SeedDefinition): boolean;

  // Signing
  signTx(accountFullId: EntryId, tx: UnsignedTx, password?: string): string;

  getConnectedHWSeed(create: boolean): SeedDescription | undefined;

  // Address Book API
  listAddressBook(blockchain: BlockchainCode): AddressBookItem[];

  addToAddressBook(item: AddressBookItem): boolean;

  removeFromAddressBook(blockchain: BlockchainCode, address: string): boolean;

  listSeedAddresses(seed: Uuid | SeedReference | SeedDefinition, blockchain: BlockchainType, hdpath: string[]): { [key: string]: string };
}
