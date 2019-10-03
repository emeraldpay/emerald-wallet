import {TxSignRequest, Account, Contact} from "@emeraldwallet/core";


export interface IVaultProvider {
  newAccount(passphrase: string, name: string, description: string, chain: string): Promise<string>;
  listAccounts(chain: string, showHidden?: boolean): Promise<Array<Account>>;
  signTransaction(tx: TxSignRequest, passphrase: string, chain: string): Promise<string>;
  importAccount(data: any, chain: string): Promise<any>;
  removeAccount(address: string, chain: string): Promise<any>;
  updateAccount(address: string, name: string, description: string, chain: string): Promise<any>;
  exportAccount(address: string, chain: string): Promise<any>;
  importAddress(contact: Contact, chain: string): Promise<boolean>;
  listAddresses(chain: string): Promise<Contact[]>;
  deleteAddress(address: string, chain: string): Promise<any>;
  generateMnemonic(): Promise<string>;
  currentVersion(): Promise<string>;
  importMnemonic(passphrase: string, name: string, description: string,
                 mnemonic: string, path: string, chain: string): Promise<string>
}