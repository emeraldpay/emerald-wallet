import {
  AccountId,
  AddAccount,
  SeedDefinition, SeedDescription, UnsignedTx,
  Uuid
} from '@emeraldpay/emerald-vault-core';
import AddressBookItem from '../address-book/AddressBookItem';
import { BlockchainCode } from '../blockchains';
import Wallet from '../entities/Wallet';
import { Account, Contact, TxSignRequest } from './types';

export default interface IVault {
  listWallets (): Wallet[];
  addWallet (label?: string): Uuid;
  getWallet (id: Uuid): Wallet | undefined;
  setWalletLabel (walletId: Uuid, label: string): boolean;
  addAccount (walletId: Uuid, account: AddAccount): AccountId;

  // export account data
  exportJsonPrivateKey (accountFullId: AccountId, password?: string): Promise<string>;
  exportRawPrivateKey (accountFullId: AccountId, password: string): Promise<string>;

  generateMnemonic (size: number): string;

  importSeed (seed: SeedDefinition): Uuid;

  // Signing
  signTx (accountFullId: AccountId, tx: UnsignedTx, password?: string): string;

  getConnectedHWSeed (create: boolean): SeedDescription | undefined;

  // Address Book API
  listAddressBook (blockchain: BlockchainCode): AddressBookItem[];
  addToAddressBook (item: AddressBookItem): boolean;
  removeFromAddressBook (blockchain: BlockchainCode, address: string): boolean;
}
