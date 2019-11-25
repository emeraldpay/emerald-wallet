import { EmeraldVaultNative, ImportMnemonic, UnsignedTx } from '@emeraldpay/emerald-vault-node';
import { blockchainByName, vault } from '@emeraldwallet/core';
import { IVaultProvider } from './types';

export class NativeVaultProvider implements IVaultProvider {
  private vault: EmeraldVaultNative;

  constructor (native: EmeraldVaultNative) {
    this.vault = native;
  }

  public currentVersion (): Promise<string> {
    return Promise.resolve(this.vault.vaultVersion());
  }

  public removeAccount (address: string, chain: string): Promise<any> {
    return Promise.resolve(this.vault.removeAccount(chain, address));
  }

  public exportAccount (address: string, chain: string): Promise<any> {
    const account = this.vault.exportAccount(chain, address);
    return Promise.resolve(account);
  }

  public generateMnemonic (): Promise<string> {
    const mnemonic = this.vault.generateMnemonic(15);
    return Promise.resolve(mnemonic);
  }

  public importAccount (data: any, chain: string): Promise<any> {
    const id = this.vault.importAccount(chain, data);
    return Promise.resolve(id);
  }

  public importMnemonic (
    passphrase: string, name: string, description: string, mnemonic: string, path: string, chain: string
  ): Promise<string> {
    const id = this.vault.importMnemonic(chain, { name, description, mnemonic, hdPath: path, password: passphrase });
    return Promise.resolve(id);
  }

  public listAccounts (chain: string, showHidden?: boolean): Promise<vault.Account[]> {
    const accounts = this.vault.listAccounts(chain);
    return Promise.resolve(accounts);
  }

  public newAccount (passphrase: string, name: string, description: string, chain: string): Promise<string> {
    const kf: ImportMnemonic = {
      mnemonic: this.vault.generateMnemonic(15),
      password: passphrase,
      hdPath: blockchainByName(chain).params.hdPath + '/0'
    };
    const id = this.vault.importMnemonic(chain, kf);
    return Promise.resolve(id);
  }

  public signTransaction (tx: vault.TxSignRequest, passphrase: string, chain: string): Promise<string> {
    const unsigned: UnsignedTx = {
      from: tx.from,
      to: tx.to,
      gas: '0x' + tx.gas.toString(16),
      gasPrice: tx.gasPrice,
      value: tx.value,
      data: tx.data,
      nonce: '0x' + tx.nonce.toString(16)
    };
    const signed = this.vault.signTx(chain, unsigned, passphrase);
    return Promise.resolve(signed);
  }

  public updateAccount (address: string, name: string, description: string, chain: string): Promise<any> {
    const updated = this.vault.updateAccount(chain, address, { name, description });
    return Promise.resolve(updated);
  }

  public listAddresses (chain: string): Promise<vault.Contact[]> {
    const book = this.vault.listAddressBook(chain);
    return Promise.resolve(book);
  }

  public importAddress (contact: vault.Contact, chain: string): Promise<boolean> {
    const success = this.vault.addToAddressBook(chain, contact);
    return Promise.resolve(success);
  }

  public deleteAddress (address: string, chain: string): Promise<any> {
    const success = this.vault.removeFromAddressBook(chain, address);
    return Promise.resolve(success);
  }

  public importPk (pk: string, passphrase: string, chain: string): Promise<string> {
    const data = {
      pk,
      password: passphrase
    };
    const address = this.vault.importPk(chain, data);
    return Promise.resolve(address);
  }

  public exportPk (address: string, passphrase: string, chain: string): Promise<string> {
    const pk = this.vault.exportPk(chain, address, passphrase);
    return Promise.resolve(pk);
  }

}
