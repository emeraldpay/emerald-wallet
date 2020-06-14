import {
  EntryId,
  AddEntry,
  SeedDefinition,
  SeedDescription,
  UnsignedTx,
  Uuid, BlockchainType
} from '@emeraldpay/emerald-vault-core';
import AddressBookItem from '../address-book/AddressBookItem';
import { BlockchainCode } from '../blockchains';
import Wallet from '../entities/Wallet';
import { Account, Contact, TxSignRequest } from './types';

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

  // Signing
  signTx(accountFullId: EntryId, tx: UnsignedTx, password?: string): string;

  getConnectedHWSeed(create: boolean): SeedDescription | undefined;

  // Address Book API
  listAddressBook(blockchain: BlockchainCode): AddressBookItem[];

  addToAddressBook(item: AddressBookItem): boolean;

  removeFromAddressBook(blockchain: BlockchainCode, address: string): boolean;

  listSeedAddresses(seed: Uuid, password: string | undefined, blockchain: BlockchainType, hdpath: string[]): { [key: string]: string };
}
