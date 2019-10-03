import {IVaultProvider} from "./types";
import {EmeraldVaultNative, ImportMnemonic, UnsignedTx} from "@emeraldpay/emerald-vault-node";
import {blockchainByName, Account, Contact, TxSignRequest} from "@emeraldwallet/core";

export class NativeVaultProvider implements IVaultProvider {
  private vault: EmeraldVaultNative;

  constructor(vault: EmeraldVaultNative) {
    this.vault = vault;
  }

  currentVersion(): Promise<string> {
    return Promise.resolve(this.vault.vaultVersion());
  }

  removeAccount(address: string, chain: string): Promise<any> {
    return Promise.resolve(this.vault.removeAccount(chain, address));
  }

  exportAccount(address: string, chain: string): Promise<any> {
    let account = this.vault.exportAccount(chain, address);
    return Promise.resolve(account);
  }

  generateMnemonic(): Promise<string> {
    let mnemonic = this.vault.generateMnemonic(15);
    return Promise.resolve(mnemonic);
  }

  importAccount(data: any, chain: string): Promise<any> {
    let id = this.vault.importAccount(chain, data);
    return Promise.resolve(id);
  }

  importMnemonic(passphrase: string, name: string, description: string, mnemonic: string, path: string, chain: string): Promise<string> {
    let id = this.vault.importMnemonic(chain, { name, description, mnemonic, hdPath: path, password: passphrase});
    return Promise.resolve(id);
  }

  listAccounts(chain: string, showHidden?: boolean): Promise<Array<Account>> {
    let accounts = this.vault.listAccounts(chain);
    return Promise.resolve(accounts);
  }

  newAccount(passphrase: string, name: string, description: string, chain: string): Promise<string> {
    let kf: ImportMnemonic = {
      mnemonic: this.vault.generateMnemonic(15),
      password: passphrase,
      hdPath: blockchainByName(chain).params.hdPath + "/0"
    };
    let id = this.vault.importMnemonic(chain, kf);
    return Promise.resolve(id);
  }

  signTransaction(tx: TxSignRequest, passphrase: string, chain: string): Promise<string> {
    let unsigned: UnsignedTx = {
      from: tx.from,
      to: tx.to,
      gas: "0x"+tx.gas.toString(16),
      gasPrice: tx.gasPrice,
      value: tx.value,
      data: tx.data,
      nonce: "0x"+tx.nonce.toString(16)
    };
    let signed = this.vault.signTx(chain, unsigned, passphrase);
    return Promise.resolve(signed);
  }

  updateAccount(address: string, name: string, description: string, chain: string): Promise<any> {
    let updated = this.vault.updateAccount(chain, address, {name, description});
    return Promise.resolve(updated);
  }

  listAddresses(chain: string): Promise<Contact[]> {
    let book: Contact[] = this.vault.listAddressBook(chain);
    return Promise.resolve(book);
  }

  importAddress(contact: Contact, chain: string): Promise<boolean> {
    let success = this.vault.addToAddressBook(chain, contact);
    return Promise.resolve(success);
  }

  deleteAddress(address: string, chain: string): Promise<any> {
    let success = this.vault.removeFromAddressBook(chain, address);
    return Promise.resolve(success);
  }
}