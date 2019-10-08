import { Account, Contact, TxSignRequest } from './types';

export interface IVault {
  currentVersion (): Promise<string>;

  signTransaction (tx: TxSignRequest, passphrase: string, chain: string): Promise<string>;

  listAccounts (chain: string): Promise<Account[]>;
  newAccount (passphrase: string, name: string, description: string, chain: string): Promise<string>;
  importAccount (data: any, chain: string): Promise<string>;
  removeAccount (address: string, chain: string): Promise<boolean>;
  exportAccount (address: string, chain: string): Promise<any>;
  updateAccount (address: string, name: string, description: string, chain: string): Promise<boolean>;

  listAddresses (chain: string): Promise<Contact[]>;
  importAddress (addressItem: Contact, chain: string): Promise<boolean> ;
  deleteAddress (address: string, chain: string): Promise<any>;

  generateMnemonic (): Promise<string>;
  importMnemonic (passphrase: string, name: string, description: string,
                  mnemonic: string, path: string, chain: string): Promise<string>;

}
