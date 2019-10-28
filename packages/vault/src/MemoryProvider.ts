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
import { pseudoRandomBytes, randomBytes } from 'crypto';
import { IVaultProvider } from './types';

export default class InMemoryProvider implements IVaultProvider {
  public accounts: {
    [chain: string]: any[]
  };

  public contracts: {
    [chain: string]: any[]
  };

  constructor () {
    this.accounts = {};
    this.contracts = {};
  }

  public currentVersion (): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public listAddresses (chain: string): Promise<vault.Contact[]> {
    throw new Error('Method not implemented.');
  }

  public importAddress (contact: vault.Contact, chain: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public deleteAddress (address: string, chain: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns the list of all not hidden (by default) accounts from the keystore.
   * @param chain - chain name
   * @param showHidden - also show hidden accounts
   * @returns {*}
   */
  public listAccounts (chain: string, showHidden: boolean = false): Promise<vault.Account[]> {
    const accounts = this.accounts[chain] || [];
    const result = accounts
        .filter((a) => (showHidden ? (true) : (!a.hidden)))
        .map((a) => ({
          address: a.address,
          name: a.name,
          description: a.description,
          hidden: a.hidden,
          hardware: a.hardware
        }));
    return Promise.resolve(result);
  }

  public signTransaction (tx: vault.TxSignRequest, passphrase: string, chain: string): Promise<string> {
    return Promise.reject(new Error('NOT IMPLEMENTED'));
  }

  public importAccount (data: any, chain: string): Promise<any> {
    return Promise.resolve();
  }

  public removeAccount (address: string, chain: string): Promise<any> {
    const accounts = this.accounts[chain] || [];
    const idx = accounts.findIndex((elem) => elem.address === address);
    if (idx >= 0) {
      this.accounts[chain][idx].hidden = true;
    }
    return Promise.resolve(true);
  }

  public exportAccount (address: string, chain: string): Promise<string> {
    const accounts = this.accounts[chain] || [];
    const idx = accounts.findIndex((elem) => elem.address === address);
    if (idx >= 0) {
      return Promise.resolve(this.accounts[chain][idx].V3);
    }
    return Promise.resolve('');
  }

  public updateAccount (address: string, name: string, description: string = '', chain: string): Promise<any> {
    return Promise.resolve();
  }

  public newAccount (passphrase: string, name: string, description: string, chain: string): Promise<string> {
    const address = `0x${randomBytes(20).toString('hex')}`;
    const accountData = {
      address,
      name,
      description,
      V3: {},
      hidden: false,
      hardware: false
    };

    this.accounts[chain] = this.accounts[chain] || [];
    this.accounts[chain].push(accountData);

    return Promise.resolve(address);
  }

  public generateMnemonic (): Promise<string> {
    return Promise.reject(new Error('NOT IMPLEMENTED'));
  }

  public importMnemonic (
    passphrase: string, name: string, description: string, mnemonic: string, path: string, chain: string
  ): Promise<string> {
    return Promise.reject(new Error('NOT IMPLEMENTED'));
  }

  public importPk (pk: string, passphrase: string, chain: string): Promise<string> {
    return Promise.reject(new Error('NOT IMPLEMENTED'));
  }

  public exportPk (address: string, passphrase: string, chain: string): Promise<string> {
    return Promise.reject(new Error('NOT IMPLEMENTED'));
  }

}
