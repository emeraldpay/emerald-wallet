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
import * as assert from 'assert';
import { IVaultProvider } from './types';
import {IVault, Account, TxSignRequest, Contact} from "@emeraldwallet/core";

function notNull(value: any, param: string) {
  return assert(value, `${param} must not be null`);
}

function notEmpty(value: any, param: string) {
  return assert(value && (value.length > 0), `${param} must not be empty`);
}

export class Vault implements IVault{
    provider: IVaultProvider;

    constructor(provider: IVaultProvider) {
      this.provider = provider;
    }

    /**
     * Returns the client current version
     */
    currentVersion(): Promise<string> {
      return this.provider.currentVersion();
    }

    /**
     * Returns the list of all not hidden (by default) accounts from the keystore.
     * @param chain - chain name
     * @param showHidden - also show hidden accounts
     * @returns {*}
     */
    listAccounts(chain: string, showHidden: boolean = false): Promise<Array<Account>> {
      notNull(chain, 'chain');
      return this.provider.listAccounts(chain, showHidden);
    }

    signTransaction(tx: TxSignRequest, passphrase: string, chain: string): Promise<string> {
      notNull(chain, 'chain');
      return this.provider.signTransaction(tx, passphrase, chain);
    }

    importAccount(data: any, chain: string) {
      notNull(chain, 'chain');
      return this.provider.importAccount(data, chain);
    }

    removeAccount(address: string, chain: string) {
      notNull(chain, 'chain');
      return this.provider.removeAccount(address, chain);
    }

    exportAccount(address: string, chain: string) {
      notNull(chain, 'chain');
      return this.provider.exportAccount(address, chain);
    }

    updateAccount(address: string, name: string, description: string = '', chain: string) {
      notNull(chain, 'chain');
      return this.provider.updateAccount(address, name, description, chain);
    }

    newAccount(passphrase: string, name: string, description: string, chain: string) {
      notNull(chain, 'chain');
      return this.provider.newAccount(passphrase, name, description, chain);
    }

    listAddresses(chain: string): Promise<Contact[]> {
      notNull(chain, 'chain');
      return this.provider.listAddresses(chain);
    }

    importAddress(addressItem: Contact, chain: string): Promise<boolean> {
      notNull(chain, 'chain');
      return this.provider.importAddress(addressItem, chain);
    }

    deleteAddress(address: string, chain: string): Promise<any> {
      return this.provider.deleteAddress(address, chain);
    }

    generateMnemonic(): Promise<string> {
      return this.provider.generateMnemonic();
    }

    /**
     * Creates new account in the vault and returns address of it
     */
    importMnemonic(
      passphrase: string, name: string, description: string,
      mnemonic: string, path: string, chain: string,
    ): Promise<string> {
      try {
        notNull(chain, 'chain');
        notEmpty(passphrase, 'passphrase');
        return this.provider.importMnemonic(passphrase, name, description, mnemonic, path, chain);
      } catch (error) {
        return Promise.reject(error);
      }
    }
}
