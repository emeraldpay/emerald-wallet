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
import { vault } from '@emeraldwallet/core';
import * as assert from 'assert';
import { IVaultProvider } from './types';

function notNull (value: any, param: string) {
  return assert(value, `${param} must not be null`);
}

function notEmpty (value: any, param: string) {
  return assert(value && (value.length > 0), `${param} must not be empty`);
}

export class Vault implements vault.IVault {
  public provider: IVaultProvider;

  constructor (provider: IVaultProvider) {
    this.provider = provider;
  }

    /**
     * Returns the client current version
     */
  public currentVersion (): Promise<string> {
    return this.provider.currentVersion();
  }

    /**
     * Returns the list of all not hidden (by default) accounts from the keystore.
     * @param chain - chain name
     * @param showHidden - also show hidden accounts
     * @returns {*}
     */
  public listAccounts (chain: string, showHidden: boolean = false): Promise<vault.Account[]> {
    notNull(chain, 'chain');
    return this.provider.listAccounts(chain, showHidden);
  }

  public signTransaction (tx: vault.TxSignRequest, passphrase: string, chain: string): Promise<string> {
    notNull(chain, 'chain');
    return this.provider.signTransaction(tx, passphrase, chain);
  }

  public importAccount (data: any, chain: string) {
    notNull(chain, 'chain');
    return this.provider.importAccount(data, chain);
  }

  public removeAccount (address: string, chain: string) {
    notNull(chain, 'chain');
    return this.provider.removeAccount(address, chain);
  }

  public exportAccount (address: string, chain: string) {
    notNull(chain, 'chain');
    return this.provider.exportAccount(address, chain);
  }

  public updateAccount (address: string, name: string, description: string = '', chain: string) {
    notNull(chain, 'chain');
    return this.provider.updateAccount(address, name, description, chain);
  }

  public newAccount (passphrase: string, name: string, description: string, chain: string) {
    notNull(chain, 'chain');
    return this.provider.newAccount(passphrase, name, description, chain);
  }

  public listAddresses (chain: string): Promise<vault.Contact[]> {
    notNull(chain, 'chain');
    return this.provider.listAddresses(chain);
  }

  public importAddress (addressItem: vault.Contact, chain: string): Promise<boolean> {
    notNull(chain, 'chain');
    return this.provider.importAddress(addressItem, chain);
  }

  public deleteAddress (address: string, chain: string): Promise<any> {
    return this.provider.deleteAddress(address, chain);
  }

  public generateMnemonic (): Promise<string> {
    return this.provider.generateMnemonic();
  }

    /**
     * Creates new account in the vault and returns address of it
     */
  public importMnemonic (
      passphrase: string, name: string, description: string,
      mnemonic: string, path: string, chain: string
    ): Promise<string> {
    try {
      notNull(chain, 'chain');
      notEmpty(passphrase, 'passphrase');
      return this.provider.importMnemonic(passphrase, name, description, mnemonic, path, chain);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public importPk (pk: string, password: string, chain: string): Promise<string> {
    return this.provider.importPk(pk, password, chain);
  }

  public exportPk (address: string, password: string, chain: string): Promise<string> {
    return this.provider.exportPk(address, password, chain);
  }
}
