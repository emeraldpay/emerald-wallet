/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {
  AddAccount,
  IEmeraldVault,
  SeedDefinition,
  SeedDescription,
  UnsignedTx
} from '@emeraldpay/emerald-vault-core';
import * as vault from '@emeraldpay/emerald-vault-core';
import { Account, AddressBookItem, BlockchainCode, IVault, Wallet } from '@emeraldwallet/core';
import { blockchainCodeToId, blockchainIdToCode } from './utils';

export class Vault implements IVault {

  public provider: IEmeraldVault;

  constructor (provider: IEmeraldVault) {
    this.provider = provider;
  }

  public getWallet (id: string): Wallet | undefined {
    const result = this.provider.getWallet(id);
    if (!result) {
      return undefined;
    }
    return this.mapToCore(result);
  }

  public listWallets (): Wallet[] {
    const result = this.provider.listWallets();
    // Map vault entities to out core entities
    return result.map((w) => this.mapToCore(w));
  }

  public addToAddressBook (item: AddressBookItem): boolean {
    return this.provider.addToAddressBook({
      address: item.address,
      blockchain: blockchainCodeToId(item.blockchain),
      description: item.description,
      name: item.name
    });
  }

  public addWallet (label: string | undefined): string {
    return this.provider.addWallet(label);
  }

  public listAddressBook (blockchain: BlockchainCode): AddressBookItem[] {
    const items = this.provider.listAddressBook(blockchainCodeToId(blockchain));
    return items.map(
      (item) => {
        return new AddressBookItem(
          blockchainIdToCode(item.blockchain),
          item.address, item.name, item.description);
      });
  }

  public removeFromAddressBook (blockchain: BlockchainCode, address: string): boolean {
    return this.provider.removeFromAddressBook(blockchainCodeToId(blockchain), address);
  }

  public addAccount (walletId: string, account: AddAccount): string {
    return this.provider.addAccount(walletId, account);
  }

  public exportJsonPrivateKey (accountFullId: string, password?: string): Promise<string> {
    return Promise.resolve(this.provider.exportJsonPk(accountFullId, password));
  }

  public exportRawPrivateKey (accountFullId: string, password: string): Promise<string> {
    return Promise.resolve(this.provider.exportRawPk(accountFullId, password));
  }

  public generateMnemonic (size: number): string {
    return this.provider.generateMnemonic(size);
  }

  public setWalletLabel (walletId: string, label: string): boolean {
    return false;
  }

  public importSeed (seed: SeedDefinition): string {
    return this.provider.importSeed(seed);
  }

  public getConnectedHWSeed (create: boolean): SeedDescription | undefined {
    return this.provider.getConnectedHWSeed(create);
  }

  public signTx (accountFullId: string, tx: UnsignedTx, password?: string): string {
    return this.provider.signTx(accountFullId, tx, password);
  }

  private mapToCore (w: vault.Wallet): Wallet {
    const newWallet = new Wallet(w.id);
    newWallet.name = w.name;
    newWallet.accounts = w.accounts.map((a: any) => {
      return {
        blockchain: blockchainIdToCode(a.blockchain),
        id: a.id,
        address: a.address
      };
    });
    return newWallet;
  }
//
//     /**
//      * Returns the client current version
//      */
//   public currentVersion (): Promise<string> {
//     return this.provider.currentVersion();
//   }
//
//     /**
//      * Returns the list of all not hidden (by default) accounts from the keystore.
//      * @param chain - chain name
//      * @param showHidden - also show hidden accounts
//      * @returns {*}
//      */
//   public listAccounts (chain: string, showHidden: boolean = false): Promise<vault.Account[]> {
//     notNull(chain, 'chain');
//     return this.provider.listAccounts(chain, showHidden);
//   }
//
//   public signTransaction (tx: vault.TxSignRequest, passphrase: string, chain: string): Promise<string> {
//     notNull(chain, 'chain');
//     return this.provider.signTransaction(tx, passphrase, chain);
//   }
//
//   public importAccount (data: any, chain: string) {
//     notNull(chain, 'chain');
//     return this.provider.importAccount(data, chain);
//   }
//
//   public removeAccount (address: string, chain: string) {
//     notNull(chain, 'chain');
//     return this.provider.removeAccount(address, chain);
//   }
//
//   public exportAccount (address: string, chain: string) {
//     notNull(chain, 'chain');
//     return this.provider.exportAccount(address, chain);
//   }
//
//   public updateAccount (address: string, name: string, description: string = '', chain: string) {
//     notNull(chain, 'chain');
//     return this.provider.updateAccount(address, name, description, chain);
//   }
//
//   public newAccount (passphrase: string, name: string, description: string, chain: string) {
//     notNull(chain, 'chain');
//     return this.provider.newAccount(passphrase, name, description, chain);
//   }
//
//   public listAddresses (chain: string): Promise<vault.Contact[]> {
//     notNull(chain, 'chain');
//     return this.provider.listAddresses(chain);
//   }
//
//   public importAddress (addressItem: vault.Contact, chain: string): Promise<boolean> {
//     notNull(chain, 'chain');
//     return this.provider.importAddress(addressItem, chain);
//   }
//
//   public deleteAddress (address: string, chain: string): Promise<any> {
//     return this.provider.deleteAddress(address, chain);
//   }
//
//   public generateMnemonic (): Promise<string> {
//     return this.provider.generateMnemonic();
//   }
//
//     /**
//      * Creates new account in the vault and returns address of it
//      */
//   public importMnemonic (
//       passphrase: string, name: string, description: string,
//       mnemonic: string, path: string, chain: string
//     ): Promise<string> {
//     try {
//       notNull(chain, 'chain');
//       notEmpty(passphrase, 'passphrase');
//       return this.provider.importMnemonic(passphrase, name, description, mnemonic, path, chain);
//     } catch (error) {
//       return Promise.reject(error);
//     }
//   }
//
//   public importPk (pk: string, password: string, chain: string): Promise<string> {
//     return this.provider.importPk(pk, password, chain);
//   }
//
//   public exportPk (address: string, password: string, chain: string): Promise<string> {
//     return this.provider.exportPk(address, password, chain);
//   }
}
